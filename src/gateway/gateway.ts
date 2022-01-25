import EventEmitter from "events";
import {MQTTTopics, MQTT_Gateway} from "./mqtt_gw";

export interface ListenArgs {
    protocol: "mqtt" | "http" | "coap",
}


export interface ListenMQTT extends ListenArgs {
    uri: string
    topics: MQTTTopics[]
}

interface telemetry {
    device_id: any,
    name: string,
    type: "string" | "number" | "boolean" | "object",
    value: any
}

export declare interface Gateway{
    on(event: 'telemetry', listener_: (telemetry: telemetry)=> void): this;
}

export class Gateway extends EventEmitter{


    mqtt_gateways: MQTT_Gateway[];

    constructor(){
        super();
        this.mqtt_gateways = [];
    }

    listen(args: ListenArgs){

        switch(args.protocol){
            case "mqtt": 
                let mqtt = args as ListenMQTT;
                let gw = this.mqtt_gateways.find(g=> g.host == mqtt.uri);
                if(gw == undefined){
                    gw = new MQTT_Gateway(mqtt.uri);
                    this.mqtt_gateways.push(gw);
                    gw.on("telemetry", (data)=>{
                        this.emit("telemetry", data);
                    });
                }
                for(let t of mqtt.topics){
                    gw.subscribe(t);
                }
            break;
            default:
                console.log("unknown protocol");
        }
    }





    send(){

    }


}

