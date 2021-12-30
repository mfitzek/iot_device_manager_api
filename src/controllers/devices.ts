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
    
    async List(req: Request,res:Response, next:NextFunction) {
        const list = await devices.DeviceList({});
        res.json(list);
    },
    
    
    async Insert(req: Request,res:Response, next:NextFunction) {
        const {name, description} = req.body;
        const device: IDevice= {
            name, description
        }

        const created = await devices.CreateDevice(device);

        res.json(created);
        
    },
    
    
    async Update(req: Request,res:Response, next:NextFunction) {
        const {device_id} = req.params;

        const {name, description} = req.body;
        const device: IDevice= {
            name, description
        }

        const updated = await devices.UpdateDevice(device_id, device);

        res.json(updated);
    },
    
    async Delete(req: Request,res:Response, next:NextFunction) {
        const {device_id} = req.params;

        const removed = await devices.DeleteDevice(device_id);

        res.json(removed);

    }
    
}


export default DeviceController;



