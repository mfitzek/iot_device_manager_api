import {sign, verify, decode, JwtPayload} from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { randomBytes } from "crypto";


import { UserToken } from "@/types/jwt_auth";

const secret = process.env.JWT_SECRET || generateSecret() ;
const expires_in = process.env.JWT_EXPIRES_IN || "2h";

function generateSecret(){
    return randomBytes(64);
}



export async function verifyToken(req: Request, res: Response, next: NextFunction){
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if(secret == "dev_test"){
        throw "Set up JWT_TOKEN";
    }


    if(token){
        verify(token, secret, (err: any, token_user: any)=>{
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

    if(secret == "dev_test"){
        throw "Set up JWT_TOKEN";
    }


    const token = await sign(user, secret, {expiresIn: expires_in});
    let exp = (decode(token) as JwtPayload).exp!;

    let expires_at = new Date(Date.now() + exp);

    return {token, expires_at: expires_at};
    
}



export function requireAuth(min_level: number = 2){
    return function(req: Request, res: Response, next: NextFunction){
        if(req.user){
            if(req.user.role < min_level){
                res.status(403).send("You have no power here");
            }else{
                next();
            }
        }else{
            res.status(401).send("Require auth");
        }
    }
}














