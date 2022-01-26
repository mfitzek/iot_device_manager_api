import { Router } from "express";

import controller from "../controllers/device_controller";


const router = Router();



router.get("/", controller.List);
router.post("/", controller.Insert);
router.get("/:device_id", controller.Get);
router.patch("/:device_id", controller.Update);
router.delete("/:device_id", controller.Delete);


router.get("/:device_id/telemetry", controller.Telemetry);


router.get("/:device_id/attributes", controller.GetDeviceAttributes);
router.post("/:device_id/attributes", controller.SetDeviceAttributes);

router.get("/:device_id/connection", controller.GetDeviceConnection);
router.post("/:device_id/connection", controller.SetDeviceConnection);



export default router;




