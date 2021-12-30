import { Router } from "express";

import controller from "../controllers/devices";


const router = Router();



router.get("/", controller.List);
router.post("/", controller.Insert);
router.get("/:device_id", controller.Get);
router.patch("/:device_id", controller.Update);
router.delete("/:device_id", controller.Delete);




export default router;




