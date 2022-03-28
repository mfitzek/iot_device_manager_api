import Database from "@db/database"
import { Gateway, ListenMQTT } from "@/gateway/gateway";



import { PrismaClient, Prisma, Device, Attribute } from "@prisma/client";
import { IAttribute, IConnection, IDevice } from "./device";


class DeviceManager{

    private static _instance: DeviceManager;

    database: PrismaClient;

    gateway: Gateway;

    private constructor(){
        this.database = new PrismaClient();
        this.gateway = new Gateway();

        this.gateway.on("telemetry", async (telemetry) =>{

            console.log("GW telemetry", telemetry);
            /*const saved = await this.database.telemetry.create({
                data: telemetry
            });*/

        });

    }


    async InitManager(){

        const devices = await this.database.device.findMany({
            include : { 
                ConnectionMQTT: {
                    include: {
                        AttributeMQTTMap: true
                    }
                }
            }
        });

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
    async DeviceList(user_id: number) {
        let data = await this.database.device.findMany({
            where:{
                ownerID: user_id
            },
            select: {
                id: true,
                name: true,
                connection: true
            }
        });
        return data;
    }

    async FindDevice(query: any){
        return await this.database.device.findFirst({
            where: query
        });
    }

    async GetDevice(id: any){

        id = Number(id);
        let data = await this.database.device.findUnique({
            where: {
                id: id
            },
            include: {
                attributes: true,
                ConnectionMQTT: {
                    include: {
                        AttributeMQTTMap: true
                    }
                },
               
            }
        });
        return data;
    }
    

    async CreateDevice(device: IDevice){
        return await this.database.device.create({
            data: device
        });
    }
    
    async UpdateDevice(id: any, device: IDevice) {
        id = Number(id);
        return await this.database.device.update({
            where: {
                id: id
            },
            data: device,
         });
    }

    async DeleteDevice(id: any) {
        id = Number(id);
        return await this.database.device.delete({where: {
            id: id
        }});
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
                                url: connection.mqtt.url,
                                clientID: connection.mqtt.clientID,
                                username: connection.mqtt.username,
                                password: connection.mqtt.password,
                            },
                            create:{
                                url: connection.mqtt.url,
                                clientID: connection.mqtt.clientID,
                                username: connection.mqtt.username,
                                password: connection.mqtt.password,
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
                        create: connection.mqtt.attribute_map
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