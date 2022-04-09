import Database from "@/db/database";

import { Gateway } from "@/gateway/gateway"

import { PrismaClient } from "@prisma/client";
import {  Device, ConnectionType, IConnection, IDeviceShort, IDeviceAttributes, AttributeType } from "./device";
import { DeviceFactory } from "./device_factory";



class DeviceManager{

    private static _instance: DeviceManager;

    database: PrismaClient;

    gateway: Gateway;


    devices: Device[] = [];

    device_factory: DeviceFactory;


    private constructor(){
        this.database = Database.Instance.prisma;
        this.device_factory = new DeviceFactory();
        this.gateway = Gateway.getInstance();

        this.InitManager();

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
                        type: device.type,
                        ownerID: device.ownerID,
                        connection: device.connection as ConnectionType
                    }
            this.devices.push(this.device_factory.create(data));
        }

        console.timeEnd("Device manager init");

        console.time("ConnectDevices");
        await this.ConnectDevices();
        console.timeEnd("ConnectDevices");


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


    async AllDeviceAttributes(user_id: number): Promise<IDeviceAttributes[]> {
        let list = await this.database.device.findMany({
            where: {
                ownerID: user_id
            },
            include: {
                attributes: true
            }
        });

        return list.map(dev=> {
            return {
                id: dev.id,
                name: dev.name,
                attributes: dev.attributes.map(attr=>{
                    return {
                        id: attr.id,
                        name: attr.name,
                        type: attr.type as AttributeType
                    }
                })
            }
        });
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



    async DeviceTelemetry(attributes: number[], start: Date, end: Date){

        
        if(attributes.length > 0){
            return await this.database.attribute.findMany({
                where: {
                    id: {
                        in: attributes
                    },
                },
                include: {
                    Telemetry: {
                        where:{
                            createdAt: {
                                gte: start,
                                lte: end
                            },
                        }
                    }
                }
            });
        }

    }



    async UpdateConnection(device_id: number, connection: IConnection){

        
    }


    async ConnectDevices(){
        for(let dev of this.devices){
            this.gateway.connect_device(dev);
        }
    }

    public static get Instance(): DeviceManager{
        return this._instance || (this._instance = new DeviceManager());
    }

}

export default DeviceManager.Instance;