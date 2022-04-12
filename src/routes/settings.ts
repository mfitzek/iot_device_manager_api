import { Router } from "express";

import backup from "@/controllers/settings_controller";




const router = Router();


router.post("/backup", backup.backup);


export default router;