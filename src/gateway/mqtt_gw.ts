import mqtt from "mqtt";
import match from "mqtt-match";

import { Device } from "@/device/device";
import {IGateway} from "./gateway"
import { randomBytes } from "crypto";


export type IMqttGateway = IGateway


interface ClientDevice {
    client: mqtt.Client,
    clientID: string,
    device: Device
}


export class MqttGateway implements IMqttGateway{

    clients: ClientDevice[];


    constructor(){
        this.clients = [];

    }


    async connect_device(dev: Device): Promise<boolean> {

        
        const connection = (await dev.detail()).connection?.mqtt

        
        if(connection){
            
            let client_id = connection.clientID;

            while(this.clients.find(dev=> dev.clientID == client_id)){
                client_id = `${connection.clientID}_${randomBytes(4).toString("hex")}`;
            }

            const client = await mqtt.connect(connection.url, {
                clientId: client_id,
                username: connection.username || undefined,
                password: connection.password || undefined,
                reconnectPeriod: 60000
            });

            for(const sub  of connection.attributes_map){
                client.subscribe(sub.path);
            }

            client.on("message", (topic, msg)=>{
                const topics = connection.attributes_map.filter(attr => match(attr.path, topic));
                for(const top of topics){
                    console.log(`GW telemetry (MQTT), dev: ${dev.id}, topic: ${topic}`);
                    dev.add_telemetry(top.attributeID, msg.toString());
                }
            });


            this.clients.push({
                client: client,
                clientID: client_id,
                device: dev,
            });


            return true;
        }
        return false;
    }


    async remove_device(dev: Device): Promise<boolean> {

        const idx = this.clients.findIndex(cl=>cl.device == dev);

        if(idx>=0){
            this.clients[idx].client.end();
            this.clients.splice(idx,1);
            return true;
        }

        return false;
    }
}