



export interface IDeviceConnector {
    listen(params: any): void,
    sendData(path: any, data: any): void,
    close(): void
}







