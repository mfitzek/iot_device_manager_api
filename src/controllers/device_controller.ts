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

    async GetDeviceAttributes(req: Request, res: Response, next: NextFunction) {
        res.send("Not implemented yet!");
    },
    async AddAttribute(req: Request, res: Response, next: NextFunction) {
        // TODO: insert or update dev attributes
        const { device_id } = req.params;
        const { name, type } = req.body;

        const device = await devices.AddAttribute(Number(device_id), name, type);

        res.json(device);
    },
    
    async UpdateAttribute(req: Request, res: Response, next: NextFunction) {
        const { device_id, attr_id } = req.params;
        const { name, type } = req.body;

        try {
            let attribute: IAttribute = {
                id: Number(attr_id),
                name,
                type,
            };
            try {
                const update = await device_manager.UpdateAttribute(attribute);
                res.json(update);
            } catch (error) {
                console.log(error);
                return res.status(500).json(error);
            }
        } catch (error) {
            return res.status(400).json(error);
        }
    },
    async DeleteAttribute(req: Request, res: Response, next: NextFunction) {
        const { attr_id } = req.params;

        try {
            const deleted = await device_manager.DeleteAttribute(Number(attr_id));
            res.json(deleted);
        } catch (error: PrismaClientKnownRequestError | any ) {
            if(error.code == "P2025"){
                return res.status(404).send("Attribute not found");
            }else{
                console.log(error);
                return res.status(500);
            }
        }
    },

    async GetDeviceConnection(req: Request, res: Response, next: NextFunction) {
        res.send("Not implemented yet!");
    },

    async SetDeviceConnection(req: Request, res: Response, next: NextFunction) {

    
        const connection: IConnection = req.body["connection"];
        console.log(connection);

        // TODO: set device connection
        res.send("Not implemented yet!");
    },
};

export default DeviceController;
