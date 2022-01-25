import { Router } from "express";

import controller from "../controllers/device_controller";


const router = Router();



router.get("/", controller.List);
router.post("/", controller.Insert);
router.get("/:device_id", controller.Get);
router.get("/:device_id/telemetry", controller.Telemetry);
router.patch("/:device_id", controller.Update);
router.delete("/:device_id", controller.Delete);




export default router;




