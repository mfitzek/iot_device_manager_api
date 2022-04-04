import Database from "@/db/database";

export type ConnectionType = "mqtt" | "http";
export type AttributeType = "number" | "string" | "object";

export interface IDeviceShort {

    id?: number,
    ownerID: number,
    name: string,
    location: string | null,
    description: string | null,
    connection: ConnectionType

}

export interface IDeviceData {

    id?: number,
    ownerID: number,
    name: string,
    location: string | null,
    description: string | null,

    connection: IConnection,
    attributes: IAttribute[],

}

export interface IAttribute {

    id?: number,
    name: string,
    type: AttributeType

}

export interface IAttributesMapMQTT{

    id?: number,
    path: string,
    attributeID: number
}

export interface IConnectionMQTT {

    id?: number,
    url: string,
    clientID: string,
    username: string | null,
    password: string | null,

    attributes_map: IAttributesMapMQTT[]

}

export interface IConnection {

    type: ConnectionType,
    mqtt: IConnectionMQTT | null,

}


export interface ITelemetry {
    deviceID: number,
    attributeID: number,
    createdAt?: Date,
    value: any
}


const database = Database.Instance.prisma;

export class Device {

    id?: number;
    ownerID: number;

    loaded: boolean = false;

    private name: string;
    private location: string | null;
    private description: string | null;

    private connection: IConnection;
    private attributes: IAttribute[] = [];

    constructor(data: IDeviceShort){
        this.id = data.id;
        this.name = data.name;
        this.location = data.location;
        this.description = data.description;

        this.connection = {
            type: data.connection,
            mqtt: null
        }

        // this.attributes = data.attributes;

        this.ownerID = data.ownerID;
    }


    async fetch_data(){
        const data  = await database.device.findUnique({
            where: {
                id: this.id!
            },
            include : { 
                attributes: true,
                ConnectionMQTT: {
                    include: {
                        AttributeMQTTMap: true
                    }
                }
            }
        });

        this.connection.type = data?.connection as ConnectionType ?? "http";


        if(data){
            this.attributes = data.attributes.map(attr=>{
                return {
                    id: attr.id,
                    name: attr.name,
                    type: attr.type as AttributeType
                }
            });

            if(data.ConnectionMQTT){
                this.connection.mqtt = {
                    id: data.ConnectionMQTT.id,
                    url: data.ConnectionMQTT.url,
                    clientID: data.ConnectionMQTT.clientID,
                    username: data.ConnectionMQTT.username,
                    password: data.ConnectionMQTT.password,
                    attributes_map: data.ConnectionMQTT.AttributeMQTTMap
                }
            }
            this.loaded = true;
        }

    }

    short_detail(){
        let data: IDeviceShort = {
            id: this.id,
            ownerID: this.ownerID,
            name: this.name,
            description: this.description,
            location: this.location,
            connection: this.connection.type
        }
        return data;
    }

    async detail(){
        if(this.loaded == false){
            await this.fetch_data();
        }

        let data: IDeviceData = {
            id: this.id,
            ownerID: this.ownerID,
            name: this.name,
            description: this.description,
            location: this.location,
            attributes: this.attributes,
            connection: this.connection
        }
        return data;
    }

    async insert(){
        const inserted = await database.device.create({
            data: this.short_detail(),
        });
        this.id = inserted.id;
        return this.short_detail();
    }

    async update(data: IDeviceShort){
        const dev = await database.device.update({
            where: {
                id: this.id
            },
            data: data
        }); 

        this.name = dev.name;
        this.description = dev.description;
        this.location = dev.location;
    }

    async delete(){
        return await database.device.delete({
            where: {
                id: this.id
            }
        });
    }

    async add_attribute(data: IAttribute){
        const attr = await database.attribute.create({
            data: {
                name: data.name,
                type: data.type,
                deviceID: this.id!
            }
        });

        const created: IAttribute = {
            id: attr.id,
            name: attr.name,
            type: attr.type as AttributeType
        }

        this.attributes.push(created);
        
        return created;
    }

    async update_attribute(data: IAttribute){
        const attr = await database.attribute.update({
            where: {
                id: data.id!
            },
            data: {
                name: data.name,
                type: data.type,
                deviceID: this.id!
            }
        });

        const updated: IAttribute = {
            id: attr.id,
            name: attr.name,
            type: attr.type as AttributeType
        }

        let idx = this.attributes.findIndex(a=> a.id == data.id);
        this.attributes[idx] = updated;
        
        return updated;
    }

    async delete_attribute(id: number){
        const attr = await database.attribute.delete({
            where: {
                id: id
            }
        });


        let idx = this.attributes.findIndex(a=> a.id == id);
        this.attributes.splice(idx, 1);
        
        return `Attribute ${id} deleted`;
    }


    async add_telemetry(telemetry: ITelemetry){

        let value = JSON.stringify(telemetry.value);
        
        const data = await database.telemetry.create({
            data: {
                deviceID: this.id!,
                value: value,
                attributeID: telemetry.attributeID,
                createdAt: telemetry.createdAt
            }
        });

        return data;

    }


    async update_connection(data: IConnection){

        if(data.type == "mqtt"){
            
            let map_to_update = data.mqtt?.attributes_map.filter(row => row.id) || [];
            let map_to_create = data.mqtt?.attributes_map.filter(row => !row.id) || [];
            let map_to_delete = this.connection.mqtt?.attributes_map.filter(row => map_to_update?.find(upt=> upt.id == row.id) === undefined) || [];
            
            const device = await database.device.update({
                where: {
                    id: this.id
                },
                data: {
                    connection: "mqtt",
                    ConnectionMQTT: {
                        upsert: {
                            update:{
                                url: data.mqtt!.url,
                                clientID: data.mqtt!.clientID,
                                username: data.mqtt!.username,
                                password: data.mqtt!.password,
                            },
                            create:{
                                url: data.mqtt!.url,
                                clientID: data.mqtt!.clientID,
                                username: data.mqtt!.username,
                                password: data.mqtt!.password,
                            },
                        }
                    }
                },
                include: {
                    ConnectionMQTT: true
                }
            });
            

            let transactions = [];
            for(let rec of map_to_update){
                let trans = database.attributeMQTTMap.update({
                    where: {
                        id: rec.id!
                    },
                    data: {
                        ...rec
                    }
                });
                transactions.push(trans);
            }
            for(let rec of map_to_create){
                let trans = database.attributeMQTTMap.create({
                    data: {
                        path: rec.path,
                        attributeID: rec.attributeID,
                        connectionID: device.ConnectionMQTT!.id
                    }
                });
                transactions.push(trans);
            }
            for(let rec of map_to_delete){
                let trans = database.attributeMQTTMap.delete({
                    where: {
                        id: rec.id!
                    }
                });
                transactions.push(trans);
            }

            await database.$transaction(transactions);

            await this.fetch_data();
            
        }

        if(data.type == "http"){

            await database.device.update({
                where:{
                    id: this.id,
                },data:{
                    connection: "http"
                }
            });


            await this.fetch_data();
            
        }




    }


}