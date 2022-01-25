import { IDevice } from "@/device/device";

import { Device, PrismaClient, Prisma } from "@prisma/client";


export default class Database{
    private static _instance: Database;

    private prisma: PrismaClient

    private constructor(){
        this.prisma = new PrismaClient();
    }

    public static get Instance(): Database{
        return this._instance || (this._instance = new Database());
    }


    public async DeviceList(query: {}): Promise<Device[]>{
        let data = await this.prisma.device.findMany(query);
        return data;
    }



    public async GetDevice(id: any, include?: Object){
        let data = await this.prisma.device.findUnique({
            where: {
                id: id
            },
            include: include
        });

        return data;
    }

    public async CreateDevice(device: IDevice){
        let data = await this.prisma.device.create({
            data: device
        });
        return data;
    }

    public async UpdateDevice(id: any, device_data: IDevice){
        let data = await this.prisma.device.update({where: {
            id: id
        }, data: device_data});
        return data;
    }

    public async DeleteDevice(id: any){
        return this.prisma.device.delete({where: {
            id: id
        }});
    }

}


