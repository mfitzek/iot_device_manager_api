import Database from "@db/database"
import { Gateway, ListenMQTT } from "@/gateway/gateway";



import { PrismaClient, Prisma, Device as DeviceDB, Attribute } from "@prisma/client";
import { IDeviceData, Device, AttributeType, ConnectionType, IConnectionMQTT, IAttribute, IConnection, IDeviceShort } from "./device";


class DeviceManager{

    private static _instance: DeviceManager;

    database: PrismaClient;

    gateway: Gateway;


    devices: Device[] = [];


    private constructor(){
        this.database = new PrismaClient();
        this.gateway = new Gateway();

        this.InitManager();


        this.gateway.on("telemetry", async (telemetry) =>{

            console.log("GW telemetry", telemetry);
            /*const saved = await this.database.telemetry.create({
                data: telemetry
            });*/

        });

    }


    async InitManager(){

        const device_list = await this.database.device.findMany({});
        console.time("Device manager init")

        for(let device of device_list){
            let data: IDeviceShort = {
                        id: device.id,
                        name: device.name,
                        description: device.description,
                        location: device.location,
                        ownerID: device.ownerID,
                        connection: device.connection as ConnectionType
                    }
            this.devices.push(new Device(data));
        }

        console.timeEnd("Device manager init");

        /*
        for(let dev of devices){
            if(dev.connection?.type?.name == "mqtt"){
                const mqtt_con = dev.connection.connectionString? JSON.parse(dev.connection.connectionString): null;
                const subscriptions = dev.mqtt_subscriptions;
                const arg: ListenMQTT = {
                    protocol: "mqtt",
                    uri: mqtt_con.broker,
                    topics: dev.mqtt_subscriptions
                }

                this.gateway.listen(arg);

            }
        }
        */

    }


    // CRUD Methods 
    DeviceList(user_id: number) {
        return this.devices.filter(device=> device.ownerID == user_id).map(dev => dev.short_detail());
    }

    async FindDevice(query: any){
        throw "Not implemented";
    }

    GetDevice(id: number): Device | undefined{
        return this.devices.find(device=> device.id == id);
    }
    
    async CreateDevice(data: IDeviceShort){
        const device = new Device(data);
        await device.insert();
        this.devices.push(device);
        return device;
    }
    

    async DeleteDevice(id: number) {
        let idx = this.devices.findIndex(dev=> dev.id == id);
        if(idx>=0){
            this.devices[idx].delete();
            this.devices.splice(idx, 1);
        }
        return `Device (${id}) deleted`;
    }



    async DeviceTelemetry(id: any, attributes: string[], start: Date, end: Date){
        id = Number(id);
        
        if(attributes.length > 0){
            return await this.database.telemetry.findMany({
                where: {
                    deviceID: id,
                    createdAt: {
                        gte: start,
                        lte: end
                    },
                    attribute: {
                        name:{
                            in: attributes
                        }
                    }
                },
                include: {
                    attribute: true
                }
            });
        }else{
            return await this.database.telemetry.findMany({
                where: {
                    deviceID: id,
                    createdAt: {
                        gte: start,
                        lte: end
                    }
                },
                include: {
                    attribute: true
                }
            });
        }

    }


    async AddAttribute(device_id: number, name: string, type: string){
        return await this.database.device.update({
            where: {
                id: device_id
            },
            data:{
                attributes: {
                    create: {
                        name: name,
                        type: type
                    }
                }
            }
        });
    }

    async UpdateAttribute(attribute: IAttribute){
        return await this.database.attribute.update({
            where: {
                id: attribute.id
            },
            data:{
                ...attribute
            }
        });
    }

    async DeleteAttribute(attr_id: number){
        return await this.database.attribute.delete({
            where: {
                id: attr_id
            }
        });
    }

    async UpdateConnection(device_id: number, connection: IConnection){

        
        if(connection.type == "mqtt"){
            const device = await this.database.device.update({
                where: {
                    id: device_id
                },
                data:{
                    connection: "mqtt",
                    
                    ConnectionMQTT: {
                        upsert: {
                            update:{
                                url: connection.mqtt!.url,
                                clientID: connection.mqtt!.clientID,
                                username: connection.mqtt!.username,
                                password: connection.mqtt!.password,
                            },
                            create:{
                                url: connection.mqtt!.url,
                                clientID: connection.mqtt!.clientID,
                                username: connection.mqtt!.username,
                                password: connection.mqtt!.password,
                            },
                        }
                    }
                },
                include: {
                    ConnectionMQTT: true
                }                
            });

            await this.database.attributeMQTTMap.deleteMany({
                where: {
                    connectionID: device.ConnectionMQTT!.id
                }
            });

            await this.database.connectionMQTT.update({
                where: {
                    id: device.ConnectionMQTT!.id
                },
                data: {
                    AttributeMQTTMap:{
                        create: connection.mqtt!.attributes_map
                    }
                }
            });

            
            return this.GetDevice(device_id);

        }

        if(connection.type == "http"){
            return this.database.device.update({
                where:{
                    id: device_id
                },
                data: {
                    connection: "http"
                }
            });
        }

    }




    async ConnectDevices(){
        //TODO: Connect all devices and listen data
    }

    public static get Instance(): DeviceManager{
        return this._instance || (this._instance = new DeviceManager());
    }

}

export default DeviceManager.Instance;