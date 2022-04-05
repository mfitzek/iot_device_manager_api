import mqtt from "mqtt";
import match from "mqtt-match";

import { Device } from "@/device/device";
import {IGateway} from "./gateway_v2"
import { randomBytes } from "crypto";


export interface IMqttGateway extends IGateway{

    //mqtt connections[]

}


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

            let client = await mqtt.connect(connection.url, {
                clientId: client_id,
                username: connection.username || undefined,
                password: connection.password || undefined,
                reconnectPeriod: 60000
            });

            for(let sub  of connection.attributes_map){
                console.log("MQTT subscribe", sub.path);
                client.subscribe(sub.path);
            }

            client.on("message", (topic, msg)=>{
                console.log("MQTT message", topic, msg.toString());
                const topics = connection.attributes_map.filter(attr => match(attr.path, topic));
                for(let topic of topics){
                    dev.add_telemetry(topic.attributeID, msg.toString());
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

        let idx = this.clients.findIndex(cl=>cl.device == dev);

        console.log("MQTT GW remove device", dev.id, idx);

        if(idx>=0){
            this.clients[idx].client.end();
            this.clients.splice(idx,1);
            return true;
        }

        return false;
    }
}