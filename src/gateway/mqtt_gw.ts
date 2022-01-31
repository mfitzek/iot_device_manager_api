import EventEmitter from "events";
import {connect, Client, MqttClient} from "mqtt";

import { MQTTSubscriptions } from "@prisma/client";
import { ITelemetry } from "@/device/telemetry/telemetry";

import match from "mqtt-match";




export declare interface MQTT_Gateway{
    on(event: 'telemetry', listener_: (telemetry: ITelemetry)=> void): this;
}

export class MQTT_Gateway extends EventEmitter{

    client: Client;
    topics: MQTTSubscriptions[];

    public host: string;

    constructor(host: string){
        super();
        this.host = host;

        this.client = connect(host);
        
        this.topics = [];
        
        this.client.on("error", (err)=>{
            console.log("MQTT GW ERR:", err);
        });

        this.client.on("connect", ()=>{
            console.log("MQTT connected to ", host);
        });

        this.client.on("message", (topic, message, packet) => {

            let topics = this.topics.filter(t => match(t.topic, topic));

            for(let _topic of topics){
                let data: ITelemetry = {
                    createdAt: new Date(),
                    deviceID: _topic.deviceID,
                    attributeID: _topic.attributeID,
                    value: message.toString()
                }
                this.emit("telemetry", data);
            }
        });
    }

    subscribe(topic: MQTTSubscriptions) {
        this.topics.push(topic);
        this.client.subscribe(topic.topic);
    }

    close(){
        this.client.end(true);
    }

}