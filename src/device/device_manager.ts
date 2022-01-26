import {Device, IDevice} from "./device";

import Database from "@db/database"
import { Gateway, ListenMQTT } from "@/gateway/gateway";
import {MQTTTopics} from "@/gateway/mqtt_gw";



import { PrismaClient, Prisma } from "@prisma/client";


class DeviceManager{

    private static _instance: DeviceManager;

    database: PrismaClient;

    gateway: Gateway;

    private constructor(){
        this.database = new PrismaClient();
        this.gateway = new Gateway();

        this.gateway.on("telemetry", async (telemetry) =>{

            const saved = await this.database.telemetry.create({
                data: {
                    deviceID: telemetry.device_id,
                    name: telemetry.name,
                    type: telemetry.type,
                    value: telemetry.value
                }
            });

        });

    }



    async InitManager(){

        const devices = await this.database.device.findMany({
            include : { 
                connection: 
                { 
                    include: {
                        mqtt_subscriptions: true,
                        type: true,
                    }
                }
            }
        });


        for(let dev of devices){
            if(dev.connection?.type?.name == "mqtt"){
                const mqtt_con = dev.connection.connectionString? JSON.parse(dev.connection.connectionString): null;
                const subscriptions = dev.connection.mqtt_subscriptions;
                const arg: ListenMQTT = {
                    protocol: "mqtt",
                    uri: mqtt_con.broker,
                    topics: subscriptions.map((topic: any): MQTTTopics => {
                        return {
                            device_id: dev.id,
                            topic: topic.topic,
                            name: topic.name,
                            type: topic.type
                        }
                    })
                }

                this.gateway.listen(arg);

            }
        }

    }




    // CRUD Methods 
    async DeviceList(query?: any) {
        let data = await this.database.device.findMany(query);
        return data;
    }
    async GetDevice(id: any){

        id = Number(id);

        let data = await this.database.device.findUnique({
            where: {
                id: id
            },
            include: {
                connection: {
                    include: {
                        type: true,
                        mqtt_subscriptions: true
                    }
                }
            }
        });
        return data;
    }

    async CreateDevice(device: IDevice){
        return await this.database.device.create({
            data: device,
            include: {
                connection: {
                    include: {
                        type: true,
                        mqtt_subscriptions: true
                    }
                }
            }
        });
    }
    
    async UpdateDevice(id: any, device: IDevice) {
        id = Number(id);
        return await this.database.device.update({
            where: {
                id: id
            },
            data: device,
            include: {
                connection: {
                    include: {
                        type: true,
                        mqtt_subscriptions: true
                    }
                }
            }
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
                    name: {
                        in: attributes
                    
                    }
                },
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