import { Request, Response, NextFunction } from "express";
import Database from "@db/database";
import { IAttribute, IConnection, IDeviceAttributes, IDeviceData, IDeviceShort } from "@/device/device";

import device_manager from "@/device/device_manager";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { to_csv, to_json, to_xml } from "@/device/telemetry/data_export";

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
        //const { device_id } = req.params;
        const { attr, date_start, date_end } = req.query;

        const owner_id = Number(req.user?.user_id);

        const attributes: number[] = [];

        if (Array.isArray(attr)) {
            for (const a of attr) {
                attributes.push(Number(a));
            }
        } else if (attr) {
            attributes.push(Number(attr));
        }

        const end = date_end ? new Date(String(date_end)) : new Date();
        const start = date_start ? new Date(String(date_start)) : new Date(0);


        const telemetry = await devices.TelemetryList(owner_id, attributes, start, end);

        // res.send("ok");
        res.json(telemetry);
    },

    async ExportTelemetry(req: Request, res: Response, next: NextFunction) {
        //const { device_id } = req.params;
        const { attr, date_start, date_end } = req.query;

        const owner_id = Number(req.user?.user_id);

        const attributes: number[] = [];

        if (Array.isArray(attr)) {
            for (const a of attr) {
                attributes.push(Number(a));
            }
        } else if (attr) {
            attributes.push(Number(attr));
        }

        const end = date_end ? new Date(String(date_end)) : new Date();
        const start = date_start ? new Date(String(date_start)) : new Date(0);


        const telemetry = await devices.TelemetryList(owner_id, attributes, start, end);


        const {format} = req.params;



        if(format == "xml"){
            const parsed = to_xml(telemetry);
            res.set('Content-Type', 'text/xml');
            res.send(parsed);
        }else if(format=="csv") {
            res.set('Content-Type', 'text/csv');
            res.send(to_csv(telemetry));
        }else{
            res.json(to_json(telemetry));
        }

        


        // res.send("ok");

    },


    async List(req: Request, res: Response, next: NextFunction) {
        const user_id = req.user!.user_id;

        const list = await devices.DeviceList(user_id);
        res.json(list);
    },

    
    async ListDeviceAttributes(req: Request, res: Response, next: NextFunction){
        const user_id = req.user!.user_id;

        const list = await devices.AllDeviceAttributes(user_id);
        res.json(list);
    },



    async Insert(req: Request, res: Response, next: NextFunction) {
        const { name, description, location, connection, type } = req.body;

        const data: IDeviceShort = {
            name,
            description,
            location,
            type: Number(type),
            ownerID: req.user!.user_id,
            connection: connection || "http"
        };
        const created = await devices.CreateDevice(data);
        res.json(await created.detail());

    },

    async Update(req: Request, res: Response, next: NextFunction) {
        const { device_id } = req.params;

        const { name, description, location, connection, type } = req.body;

        const data: IDeviceShort = {
            name,
            description,
            location,
            type: Number(type),
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


    async ConnectionHttpRefreshToken(req: Request, res: Response, next: NextFunction){
        const {device_id} = req.params;
        const device = devices.GetDevice(Number(device_id));
        await device?.refresh_http_token();
        const detail = await device?.detail();
        
        res.json(detail);
    }
};

export default DeviceController;
