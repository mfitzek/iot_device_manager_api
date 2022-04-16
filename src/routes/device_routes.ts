
import { NextFunction, Router, Request, Response } from "express";

import controller from "../controllers/device_controller";


const router = Router();



router.get("/", controller.List);
router.post("/", controller.Insert);

router.get("/attributes", controller.ListDeviceAttributes);
router.get("/telemetry", controller.Telemetry );

router.get("/telemetry/export/:format", controller.ExportTelemetry );


router.use("/:device_id/", controller.CheckDeviceOwner);
router.get("/:device_id", controller.Get);
router.patch("/:device_id", controller.Update);
router.delete("/:device_id", controller.Delete);


// router.get("/:device_id/telemetry", controller.Telemetry);

router.post("/:device_id/attributes", controller.AddAttribute);
router.patch("/:device_id/attributes/:attr_id", controller.UpdateAttribute);
router.delete("/:device_id/attributes/:attr_id", controller.DeleteAttribute);

router.post("/:device_id/connection", controller.SetDeviceConnection);
router.post("/:device_id/connection/http/refresh", controller.ConnectionHttpRefreshToken);



export default router;




