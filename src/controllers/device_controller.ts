import { Request, Response, NextFunction } from "express";
import Database from "@db/database";
import { IAttribute, IConnection, IDeviceData, IDeviceShort } from "@/device/device";

import device_manager from "@/device/device_manager";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

const devices = device_manager;

const DeviceController = {

    async Get(req: Request, res: Response, next: NextFunction) {
        const { device_id } = req.params;

        const user = req.user!.user_id;

        const device = await devices.GetDevice(Number(device_id))?.detail();
        if(device){
            res.json(device);
        }else{
            res.status(404).send("not found");
        }

    },

    async Telemetry(req: Request, res: Response, next: NextFunction) {
        const { device_id } = req.params;
        const { attr, date_start, date_end } = req.query;

        let attributes: string[] = [];

        if (Array.isArray(attr)) {
            for (let a of attr) {
                attributes.push(a.toString());
            }
        } else if (attr) {
            attributes.push(attr.toString());
        }

        let end = date_end ? new Date(String(date_end)) : new Date();
        let start = date_start ? new Date(String(date_start)) : new Date(0);

        console.log({ device_id, attributes, start, end });

        const telemetry = await devices.DeviceTelemetry(device_id, attributes, start, end);

        res.json(telemetry);
    },

    async List(req: Request, res: Response, next: NextFunction) {
        const user_id = req.user!.user_id;

        const list = await devices.DeviceList(user_id);
        res.json(list);
    },

    async Insert(req: Request, res: Response, next: NextFunction) {
        const { name, description, location, connection } = req.body;

        const data: IDeviceShort = {
            name,
            description,
            location,
            ownerID: req.user!.user_id,
            connection: connection || "http"
        };
        const created = await devices.CreateDevice(data);
        res.json(await created.detail());

    },

    async Update(req: Request, res: Response, next: NextFunction) {
        const { device_id } = req.params;

        const { name, description, location, connection } = req.body;

        const data: IDeviceShort = {
            name,
            description,
            location,
            ownerID: req.user!.user_id,
            connection: connection
        };

        const device = devices.GetDevice(Number(device_id));
        await device?.update(data);

        res.json(await device?.detail());
    },

    async Delete(req: Request, res: Response, next: NextFunction) {
        const { device_id } = req.params;

        const removed = await devices.DeleteDevice(Number(device_id));

        res.json(removed);
    },


    async CheckDeviceOwner(req: Request, res: Response, next: NextFunction){
        const owner = req.user?.user_id;
        const device_id = Number(req.params["device_id"]);

        if(!owner){
            return  res.status(401).send("Please log in");
        }

        const device = await devices.GetDevice(device_id);
        if(device && device.ownerID == owner){
            return next();
        }else if (device){
            return res.status(403).send("Not your device");
        }else{
            return res.status(404).send("Not found");
        }
    },


    async AddAttribute(req: Request, res: Response, next: NextFunction) {

        const { device_id } = req.params;
        const { name, type } = req.body;

        const device = devices.GetDevice(Number(device_id));

        const attr = await device?.add_attribute({
            name: name,
            type: type
        })

        res.json(attr);
    },
    
    async UpdateAttribute(req: Request, res: Response, next: NextFunction) {
        const { device_id, attr_id } = req.params;
        const { name, type } = req.body;


        const device = devices.GetDevice(Number(device_id));

        const attr = await device?.update_attribute({
            id: Number(attr_id),
            name: name,
            type: type
        })

        res.json(attr);

      
    },
    async DeleteAttribute(req: Request, res: Response, next: NextFunction) {
        const { device_id, attr_id } = req.params;

        const device = devices.GetDevice(Number(device_id));

        const attr = await device?.delete_attribute(Number(attr_id));

        res.json(attr);
    },


    async SetDeviceConnection(req: Request, res: Response, next: NextFunction) {

        const {device_id} = req.params;
        const connection: IConnection = req.body["connection"];
        

        const device = devices.GetDevice(Number(device_id));
        await device?.update_connection(connection);

        const detail = await device?.detail();
        
        res.json(detail);
    },
};

export default DeviceController;
