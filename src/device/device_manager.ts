import Database from "@db/database"

import { Gateway } from "@/gateway/gateway_v2";

import { PrismaClient, Prisma, Device as DeviceDB, Attribute } from "@prisma/client";
import { IDeviceData, Device, AttributeType, ConnectionType, IConnectionMQTT, IAttribute, IConnection, IDeviceShort } from "./device";


class DeviceManager{

    private static _instance: DeviceManager;

    database: PrismaClient;

    gateway: Gateway;


    devices: Device[] = [];


    private constructor(){
        this.database = new PrismaClient();
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
                        ownerID: device.ownerID,
                        connection: device.connection as ConnectionType
                    }
            this.devices.push(new Device(data));
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