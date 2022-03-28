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

export interface IAttributeMap{
    path: string
    attributeID: number
}

export interface IConnection{
    type: "http" | "mqtt",
    mqtt: {
        id?: number,
        url: string,             
        clientID: string,
        username?: string,        
        password?: string,
        attribute_map: IAttributeMap[]
    }
}