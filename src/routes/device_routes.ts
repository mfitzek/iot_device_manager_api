import { Router } from "express";

import controller from "../controllers/devices";


const router = Router();



router.get("/", controller.List);
router.post("/", controller.Insert);
router.get("/:id", controller.Get);
router.put("/:id", controller.Update);
router.delete("/:id", controller.Delete);




export default router;




