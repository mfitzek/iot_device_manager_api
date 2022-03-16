import { Request, Response, NextFunction} from "express";
import Database from "@db/database";
import { IDevice } from "@/device/device";



import device_manager from "@/device/device_manager";

const devices = device_manager;

 
const DeviceController = {

    async Get(req: Request, res:Response, next:NextFunction) {
        const {device_id} = req.params;

        const device = await devices.GetDevice(device_id);

        res.json(device);
    },

    async Telemetry(req: Request, res: Response, next: NextFunction){
        
        const {device_id} = req.params;
        const {attr, date_start, date_end} = req.query;
        
        let attributes: string[] = [];
        
        
        if(Array.isArray(attr)){
            for(let a of attr){
                attributes.push(a.toString());
            }
        }else if(attr){
            attributes.push(attr.toString());
        }


        let end = date_end? new Date(String(date_end)) : new Date();
        let start = date_start? new Date(String(date_start)) : new Date(0);

        console.log({device_id, attributes, start, end});

       const telemetry = await devices.DeviceTelemetry(device_id, attributes, start, end);


        res.json(telemetry);


    },
    
    async List(req: Request,res:Response, next:NextFunction) {
        const list = await devices.DeviceList({});
        res.json(list);
    },
    
    
    async Insert(req: Request,res:Response, next:NextFunction) {
        const {name, description, location} = req.body;
        const device: IDevice= {
            name, description, location
        }

        const created = await devices.CreateDevice(device);

        res.json(created);
        
    },
    
    
    async Update(req: Request,res:Response, next:NextFunction) {
        const {device_id} = req.params;

        const {name, description, location} = req.body;
        const device: IDevice= {
            name, description, location
        }

        const updated = await devices.UpdateDevice(device_id, device);

        res.json(updated);
    },
    
    async Delete(req: Request,res:Response, next:NextFunction) {
        const {device_id} = req.params;

        const removed = await devices.DeleteDevice(device_id);

        res.json(removed);

    },



    async GetDeviceAttributes(req: Request,res:Response, next:NextFunction){

        res.send("Not implemented yet!");

    },

    async SetDeviceAttributes(req: Request,res:Response, next:NextFunction){
        // TODO: insert or update dev attributes
        res.send("Not implemented yet!");

    },

    async GetDeviceConnection(req: Request,res:Response, next:NextFunction){

        res.send("Not implemented yet!");

    },

    async SetDeviceConnection(req: Request,res:Response, next:NextFunction){
        // TODO: set device connection
        res.send("Not implemented yet!");

    }
    


    
}


export default DeviceController;



