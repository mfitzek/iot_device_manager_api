import { Router } from "express";

import backup from "@/controllers/settings_controller";

import multer from "multer";
const storage = multer.memoryStorage();




const router = Router();


router.post("/backup", backup.backup);
router.post("/restore", multer({storage}).single("backup"), backup.restore);


export default router;