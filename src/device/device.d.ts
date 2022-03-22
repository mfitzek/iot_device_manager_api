export interface IDevice {
    name: string,
    description: string?,
    location: string?
}



export interface IAttribute{
    id?: number,
    deviceID: number,
    name: string,
    type: string,
}