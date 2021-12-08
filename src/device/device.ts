




export interface IDevice {
    id: any;
    name: String;
    type: String;
    description: String;
    serial?: String
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

