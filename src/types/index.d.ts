import {Request, Express} from "express";
import {UserToken} from "@/types/jwt_auth/index";


declare global {
    namespace Express {
        interface Request {
            user?: UserToken;
        }
    }

}