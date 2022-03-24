export interface IDevice {
    name: string,
    description: string?,
    location: string?,
    ownerID: number
}



export interface IAttribute{
    id?: number,
    deviceID: number,
    name: string,
    type: string,
}