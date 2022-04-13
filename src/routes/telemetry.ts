import device_manager from "@/device/device_manager";
import { Router, Request, Response } from "express";



const router = Router();


//HTTP Gateway

router.post("/:device_id", async (req: Request, res: Response)=>{
    const {device_id} = req.params;
    const {access_token} = req.headers;

    const attr = [];

    if(device_id && access_token && !Array.isArray(access_token)){

        for(const x in req.body){
            attr.push({name: x, value: req.body[x]});
        }

        device_manager.gateway.http_gw.telemetry(Number(device_id), access_token, attr);
       
    }

    res.status(400);
    


});







export default router;