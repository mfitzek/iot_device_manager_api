import {sign, verify} from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";


import { UserToken } from "@/types/jwt_auth";

const secret = process.env.JWT_SECRET?? "dev_test";





export async function verifyToken(req: Request, res: Response, next: NextFunction){
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if(secret == "dev_test"){
        throw "Set up JWT_TOKEN";
    }


    if(token){
        verify(token, secret, (err: any, token_user: UserToken)=>{
            if(!err){
                req.user = {
                    user_id: token_user.user_id,
                    role: token_user.role
                }
            }
        });
    }
    next();
}


export async function signToken(user: UserToken){

}















