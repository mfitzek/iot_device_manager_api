import { AsyncClient, connectAsync} from "async-mqtt";

import { Device } from "@/device/device";
import {IGateway} from "./gateway_v2"


export interface IMqttGateway extends IGateway{

    //mqtt connections[]

}


interface ClientDevice {
    client: AsyncClient,
    device: Device
}


export class MqttGateway implements IMqttGateway{

    clients: ClientDevice[];


    constructor(){
        this.clients = [];

    }


    async connect_device(dev: Device): Promise<boolean> {
        const connection = (await dev.detail()).connection?.mqtt;
        if(connection){
            let client = await connectAsync(connection.url, {
                clientId: connection.clientID,
                username: connection.username || undefined,
                password: connection.password || undefined
            });

            if(client)


            return true;
        }
        return false;
    }


    async remove_device(dev: Device): Promise<boolean> {
        return true;
    }
}