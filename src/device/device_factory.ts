

import { Device, IDeviceShort } from "./device";


export class DeviceFactory{


    create(data: IDeviceShort): Device{
        switch(data.type){

            default: 
                return new Device(data);
        }
    }

}