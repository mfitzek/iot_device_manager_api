
export { Device } from "@prisma/client";



export interface IDevice {
    name: string;
    description?: string;
}




export interface IDeviceConnetion{
    id: any
    device: IDevice
    connection_string: string // JSON
}





export interface IDeviceGroup{
    name: string;
    description: string;
    devices: IDevice[];
}

export interface ITelemetry{
    date: Date,
    device: IDevice,
    data: any
}

