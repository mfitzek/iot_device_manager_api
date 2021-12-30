import {Device, IDevice} from "./device";

import Database from "@db/database"







class DeviceManager{

    private static _instance: DeviceManager;

    database: Database

    private constructor(){
        this.database = Database.Instance
    }


    async DeviceList(query: any) {
        let data = await this.database.DeviceList(query);
        return data;
    }
    async GetDevice(id: any){

        id = Number(id);

        let data = await this.database.GetDevice(id, {
            telemetry: true
        });
        return data;
    }

    async CreateDevice(device: IDevice){
        return await this.database.CreateDevice(device);
    }
    
    async UpdateDevice(id: any, device: IDevice) {
        id = Number(id);
        return await this.database.UpdateDevice(id, device);
    }

    async DeleteDevice(id: any) {
        id = Number(id);
        return await this.database.DeleteDevice(id);
    }


    async ConnectDevices(){
        //TODO: Connect all devices and listen data
    }




    public static get Instance(): DeviceManager{
        return this._instance || (this._instance = new DeviceManager());
    }

}

export default DeviceManager.Instance;