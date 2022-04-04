import { Device } from "@device/device";




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

    constructor(){

    }


    async connect_device(dev: Device) {

        this.devices.push(dev);

        return true;
    }

    async remove_device(dev: Device) {
        
        this.devices.splice(this.devices.indexOf(dev), 1);


        return true;
    }
}


