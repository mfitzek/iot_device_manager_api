import {Router} from "express"

import device_router from "./device_routes";



const router = Router();



router.use("/device", device_router);







export default router;