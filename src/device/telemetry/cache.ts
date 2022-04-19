


import {ITelemetry} from "../device";


import Database from "@/db/database";


const database = Database.Instance.prisma;

const max_cap = 10000;
const max_time = 15*60*1000 // 15 minutes

class TelemetryCache {
    
    max_capacity: number;
    max_time: number // ms

    primary_cache: ITelemetry[] = [];
    secondary_cache: ITelemetry[] = [];
    primary = true;

    primary_timer: NodeJS.Timer | null = null;
    secondary_timer: NodeJS.Timer | null = null;

    private static _instance: TelemetryCache

    private constructor(max_capacity: number, max_time: number){
        this.max_capacity = max_capacity;
        this.max_time = max_time;
    }

    public static get Instance(){
        return TelemetryCache._instance?? (TelemetryCache._instance = new TelemetryCache(max_cap, max_time));
    }


    async push(telemetry: ITelemetry){

        if(this.primary){
            if(this.primary_timer == null){
                this.primary_timer = setTimeout(()=>{this.save_primary()}, this.max_time);
            }
            this.primary_cache.push(telemetry);
    
            if(this.primary_cache.length >= this.max_capacity){
                this.primary = false;
                this.save_primary();
            }
        }else{
            if(this.secondary_timer == null){
                this.secondary_timer = setTimeout(()=>{this.save_secondary()}, this.max_time);
            }
    
            this.secondary_cache.push(telemetry);
    
            if(this.secondary_cache.length >= this.max_capacity){
                this.primary = true;
                this.save_secondary();
            }
        }

        return telemetry;

    }



    async save_primary(){

        if(this.primary_timer){
            clearTimeout(this.primary_timer);
            this.primary_timer = null;
        }

        console.log("Saving primary cache");
        try {
            await this.save_to_db(this.primary_cache);
            this.primary_cache = [];
        } catch (error) {
            console.log(error);
        }

        console.log("Primary cache saved");


    }

    async save_secondary(){
        if(this.secondary_timer){
            clearTimeout(this.secondary_timer);
            this.secondary_timer = null;
        }

        console.log("Saving secondary cache");
        try {
            await this.save_to_db(this.secondary_cache);
            this.secondary_cache = [];
        } catch (error) {
            console.log(error);
        }
        console.log("Secondary cache saved");


    }


    async save_to_db(data: ITelemetry[]){
        return database.$transaction(data.map(cur=>{
            return database.telemetry.create({
                data: {
                    deviceID: cur.deviceID,
                    attributeID: cur.attributeID,
                    value: JSON.stringify(cur.value),
                    createdAt: cur.createdAt
                }
            });
        }));
    }


    current_cache(){
        return this.primary? this.primary_cache : this.secondary_cache;
    }

}




export default TelemetryCache.Instance;