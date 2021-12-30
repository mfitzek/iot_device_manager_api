import { IDeviceConnector } from "./connector";
import { IDevice } from "@device/device";




class MQTTDeviceConnector implements IDeviceConnector{

    device: IDevice;

    constructor(device: IDevice){
        this.device = device;
    }
    
    listen(params: any): void {
        throw new Error("Method not implemented.");
    }
    sendData(path: any, data: any): void {
        throw new Error("Method not implemented.");
    }
    close(): void {
        throw new Error("Method not implemented.");
    }
    
}