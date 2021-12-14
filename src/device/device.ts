




export interface IDevice {
    id: any;
    name: String;
    type: String;
    description?: String;
}


export interface IDeviceConnetion{
    id: any
    device: IDevice
    connection_string: String // JSON
}








export interface IDeviceGroup{
    name: String;
    description: String;
    devices: IDevice[];
}

export interface ITelemetry{
    date: Date,
    device: IDevice,
    data: any
}

