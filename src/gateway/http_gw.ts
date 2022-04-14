import { Device } from "@/device/device";

import { IGateway } from "./gateway";



export interface IData{
    name: string,
    value: string
}




export class HttpGateway implements IGateway{

    devices: Device[] = [];


    async telemetry(device_id: number, access_token: string, data: IData[]){

        console.log(`GW telemtry(HTTP): dev:${device_id}, token: ${access_token}, data_length: ${data.length}`);

        const dev = this.devices.find(d=>d.id == device_id);
        const detail = await dev?.detail();
        const dev_token = detail?.connection.http?.access_token;

        if(dev && dev_token && dev_token === access_token){

            for(const d of data){
                const attr = detail.attributes.find(a=>a.name === d.name);

                if(attr && attr.id){
                    dev.add_telemetry(attr.id, d.value);
                }

            }

            return true;
        }

        return false;

    }

    async connect_device(dev: Device) {
        this.devices.push(dev);
        return true;
    }

    async remove_device(dev: Device) {
        
        const idx = this.devices.indexOf(dev);

        if(idx>=0){
            this.devices.splice(idx,1);
            return true;
        }
        
        return false;
    }

    async disconnet_all(): Promise<void> {
        const device_list = [...this.devices];
        for(const d of device_list){
            this.remove_device(d);
        }
    }

}