import { Request, Response, NextFunction } from "express";
import Database from "@db/database";
import { IAttribute, IDevice } from "@/device/device";

import device_manager from "@/device/device_manager";

const devices = device_manager;

const DeviceController = {
    async Get(req: Request, res: Response, next: NextFunction) {
        const { device_id } = req.params;

        const user = req.user!.user_id;

        const device = await devices.GetDevice(device_id);

        res.json(device);
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
        //        const user_id = req.user!.user_id;

        const list = await devices.DeviceList({});
        res.json(list);
    },

    async Insert(req: Request, res: Response, next: NextFunction) {
        const { name, description, location } = req.body;
        const device: IDevice = {
            name,
            description,
            location,
        };

        const created = await devices.CreateDevice(device);

        res.json(created);
    },

    async Update(req: Request, res: Response, next: NextFunction) {
        const { device_id } = req.params;

        const { name, description, location } = req.body;
        const device: IDevice = {
            name,
            description,
            location,
        };

        const updated = await devices.UpdateDevice(device_id, device);

        res.json(updated);
    },

    async Delete(req: Request, res: Response, next: NextFunction) {
        const { device_id } = req.params;

        const removed = await devices.DeleteDevice(device_id);

        res.json(removed);
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
                deviceID: Number(device_id),
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
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },

    async GetDeviceConnection(req: Request, res: Response, next: NextFunction) {
        res.send("Not implemented yet!");
    },

    async SetDeviceConnection(req: Request, res: Response, next: NextFunction) {
        // TODO: set device connection
        res.send("Not implemented yet!");
    },
};

export default DeviceController;
