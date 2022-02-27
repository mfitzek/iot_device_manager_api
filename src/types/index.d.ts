import {Request, Express} from "express";

export interface UserToken {
    user_id: any,
    role: Number
}


declare namespace Express {
    interface Request {
        user?: UserToken;
    }
}