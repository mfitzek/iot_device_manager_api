import EventEmitter from "events";
import {connect, Client, MqttClient} from "mqtt";

import match from "mqtt-match";


export interface MQTTTopics {
    device_id: any
    topic: string,
    name: string,
    type: "string" | "number" | "boolean" | "object"
}


export declare interface MQTT_Gateway{
    on(event: 'telemetry', listener_: (telemetry: {device_id: any, name: string, value: any})=> void): this;
}

export class MQTT_Gateway extends EventEmitter{

    client: Client;
    topics: MQTTTopics[];

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

                this.emit("telemetry", {..._topic, value: message.toString()});

            }
            


        });
    }

    subscribe(topic: MQTTTopics) {
        this.topics.push(topic);
        this.client.subscribe(topic.topic);
    }

    close(){
        this.client.end(true);
    }

}