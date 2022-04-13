import {Router} from "express"

import device_router from "./device_routes";
import authRoute from "./auth_route";
import { requireAuth, verifyToken } from "@/jwt_auth/auth";

import settings_router from "./settings";
import telemetry_router from "./telemetry";


const router = Router();


router.use(verifyToken);

router.use("/auth", authRoute);
router.use("/device", requireAuth(), device_router);
router.use("/settings", settings_router);
router.use("/telemetry", telemetry_router);









export default router;