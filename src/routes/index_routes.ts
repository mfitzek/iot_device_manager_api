import {Router} from "express"

import device_router from "./device_routes";
import authRoute from "./auth_route";
import { requireAuth, verifyToken } from "@/jwt_auth/auth";



const router = Router();


router.use(verifyToken);

router.use("/auth", authRoute);
router.use("/device", requireAuth(), device_router);









export default router;