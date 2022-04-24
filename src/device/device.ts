import Database from "@/db/database";
import { Gateway } from "@/gateway/gateway"
import { randomUUID } from "crypto";
import TelemetryCache from "./telemetry/cache";



export type ConnectionType = "mqtt" | "http";
export type AttributeType = "number" | "string" | "object";


export const DeviceTypeList = [
    "General device"
]

export enum DeviceType{
    General = 0
}


export interface IDeviceAttributes {
    id: number,
    name: string,
    attributes: IAttribute[],
}


export interface IDeviceShort {

    id?: number,
    ownerID: number,
    name: string,
    location: string | null,
    description: string | null,
    type: DeviceType,
    connection: ConnectionType,
    last_telemetry?: Date | null,
    online?: boolean
}



export interface IDeviceData {

    id?: number,
    ownerID: number,
    name: string,
    location: string | null,
    description: string | null,
    type: DeviceType,
    last_telemetry: Date | null,
    online: boolean

    connection: IConnection,
    attributes: IAttribute[],

}

export interface IAttribute {

    id?: number,
    name: string,
    type: AttributeType,
    telemetry?: ITelemetry[]

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

export interface IConnectionHTTP {
    id?: number,
    access_token: string
}

export interface IConnection {

    type: ConnectionType,
    mqtt: IConnectionMQTT | null,
    http: IConnectionHTTP | null

}


export interface ITelemetry {
    deviceID: number,
    attributeID: number,
    createdAt?: Date,
    value: any
}


const database = Database.Instance.prisma;
const gateway = Gateway.getInstance();

export class Device {

    id?: number;
    ownerID: number;

    loaded = false;

    private name: string;
    private location: string | null;
    private description: string | null;

    private connection: IConnection;
    private attributes: IAttribute[] = [];
    private type: DeviceType;

    public online = false;
    public last_telemetry: Date | null = null;


    constructor(data: IDeviceShort){
        this.id = data.id;
        this.name = data.name;
        this.location = data.location;
        this.description = data.description;
        this.type = data.type;

        this.connection = {
            type: data.connection,
            mqtt: null,
            http: null
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
                },
                ConnectionHTTP: true
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
            
            if(data.ConnectionHTTP){
                this.connection.http = {
                    id: data.ConnectionHTTP.id,
                    access_token: data.ConnectionHTTP.access_token
                }
            }

            this.loaded = true;


        }

    }

    short_detail(){
        const data: IDeviceShort = {
            id: this.id,
            ownerID: this.ownerID,
            name: this.name,
            description: this.description,
            type: this.type,
            location: this.location,
            connection: this.connection.type,
            last_telemetry: this.last_telemetry,
            online: this.online
        }
        return data;
    }

    async detail(){
        if(this.loaded == false){
            await this.fetch_data();
        }

        const data: IDeviceData = {
            id: this.id,
            ownerID: this.ownerID,
            name: this.name,
            description: this.description,
            location: this.location,
            type: this.type,
            attributes: this.attributes,
            connection: this.connection,
            last_telemetry: this.last_telemetry,
            online: this.online
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

        const idx = this.attributes.findIndex(a=> a.id == data.id);
        this.attributes[idx] = updated;
        
        return updated;
    }

    async delete_attribute(id: number){
        const attr = await database.attribute.delete({
            where: {
                id: id
            }
        });


        const idx = this.attributes.findIndex(a=> a.id == id);
        this.attributes.splice(idx, 1);
        
        return `Attribute ${id} deleted`;
    }


    async add_telemetry(attribute_id: number, value: string){

        if(!this.loaded){
            await this.fetch_data(); 
        }
        const telemetry_date = new Date();
        this.online = true;
        this.last_telemetry = new Date();
        


        const attr = this.attributes.find(a=>a.id == attribute_id);

        if(attr){
            let converted;
            try {
                switch(attr.type){
                    case "number":
                        converted = Number(value); break;
                    case "object":
                        converted = JSON.parse(value); break;
                    case "string":
                        converted = value;
                }
            } catch (error) {
                console.log("Telemetry value conversion error");
                return null;
            }

            const data = await TelemetryCache.push({
                deviceID: this.id!,
                value: JSON.stringify(converted),
                attributeID: attribute_id,
                createdAt: telemetry_date
            });

            return data;
        }
        
        return null;
        
    }


    async update_connection(data: IConnection){

        if(data.type == "mqtt"){
           await this.update_mqtt_connection(data);
        }

        if(data.type == "http"){

            const dev = await database.device.update({
                where:{
                    id: this.id,
                },data:{
                    connection: "http"
                },include: {
                    ConnectionHTTP: true
                }
            });

            if(!dev.ConnectionHTTP){
                await this.refresh_http_token();
            }


            await this.fetch_data();
            
        }

        await gateway.remove_device(this);
        await gateway.connect_device(this);

    }



    async update_mqtt_connection(data: IConnection){

        const map_to_update = data.mqtt?.attributes_map.filter(row => row.id) || [];
        const map_to_create = data.mqtt?.attributes_map.filter(row => !row.id) || [];
        const map_to_delete = this.connection.mqtt?.attributes_map.filter(row => map_to_update?.find(upt=> upt.id == row.id) === undefined) || [];
        
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
        

        const transactions = [];
        for(const rec of map_to_update){
            const trans = database.attributeMQTTMap.update({
                where: {
                    id: rec.id!
                },
                data: {
                    ...rec
                }
            });
            transactions.push(trans);
        }
        for(const rec of map_to_create){
            const trans = database.attributeMQTTMap.create({
                data: {
                    path: rec.path,
                    attributeID: rec.attributeID,
                    connectionID: device.ConnectionMQTT!.id
                }
            });
            transactions.push(trans);
        }
        for(const rec of map_to_delete){
            const trans = database.attributeMQTTMap.delete({
                where: {
                    id: rec.id!
                }
            });
            transactions.push(trans);
        }

        await database.$transaction(transactions);

        await this.fetch_data();
    }

    async refresh_http_token(){
        const uid = randomUUID();

        await database.device.update({
            where: {
                id: this.id!
            },
            data: {
                ConnectionHTTP: {
                    upsert: {
                        update: {
                            access_token: uid
                        },
                        create: {
                            access_token: uid
                        }
                    },
                    
                }
            }
        });

        await this.fetch_data();

    }


}