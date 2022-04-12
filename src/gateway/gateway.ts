import { Device } from "@device/device";
import { MqttGateway } from "./mqtt_gw";




export interface IGateway{

    // connected devices []

    connect_device(dev: Device): Promise<boolean>,
    remove_device(dev: Device): Promise<boolean>,

}




export interface IHttpGateway extends IGateway{

    receive_data(): void // bridge data from API 

}



export class Gateway implements IGateway {

    devices: Device[] = [];

    mqtt_gw: MqttGateway;

    private static _instance: Gateway;

    private constructor(){
        this.mqtt_gw = new MqttGateway();
    }

    static getInstance(): Gateway{
        if(!Gateway._instance){
            Gateway._instance = new Gateway();
        }
        return Gateway._instance;
    }


    async connect_device(dev: Device) {

        const detail = await dev.detail();

        switch(detail.connection.type){
            case "mqtt": 
                if(await this.mqtt_gw.connect_device(dev)){
                    this.devices.push(dev);
                    return true;
                }
        }

        return false;

    }

    async remove_device(dev: Device) {
        
        this.mqtt_gw.remove_device(dev);

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


