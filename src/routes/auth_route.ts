import { Router } from "express";
import { hash, compare } from "bcrypt";

import Database from "@/db/database";
import { signToken } from "@/jwt_auth/auth";


const db = Database.Instance.prisma;


const router = Router();



router.post("/login", async (req, res, next)=>{

    const {email, password} = req.body;

    if(!(email && password)){
        res.status(401).json({error: "Email and password is required"});
        return;
    }
    
    const user = await db.user.findUnique({
        where: {
            email: email
        }
    });

    if(!user){

        res.json({
            error: "Wrong email address or password"
        });

    }else{
        const equal = await compare(password, user.password);
        if(equal){
            
            const {token, expires_at} = await signToken({
                user_id: user.id,
                role: user.role
            });

            res.json({
                id: user.id,
                email: user.email,
                username: user.username,
                token: token,
                expires_at: expires_at
            });

        }else{
            res.json({
                error: "Wrong email address or password"
            });
        }
    }
});


router.post("/signup", async (req, res, next)=>{

    const {email, username, password} = req.body;
    console.log("body: ", email, username, password);

    if(!(email && username && password)){
        res.status(400).json({error: "Email,Username and password is required"});
        return;
    }

    const email_search =  await db.user.findUnique({
        where: {
            email: email
        }
    });

    const username_search = await db.user.findUnique({
        where: {
            username: username
        }
    });


    let errors =  [];

    if(email_search){
        errors.push({
            property: "email",
            message: "Email already in use"
        });
    }
    if(username_search){
        errors.push({
            property: "username",
            message: "Username already in use"
        });
    }

    if(errors.length > 0){
        res.status(409).json({errors: errors});
        return;
    }



    const user = await db.user.create({data: {
        username: username,
        email: email,
        password: await hash(password, 10)
    }});
    

    res.status(201).json({
        id: user.id,
        email: user.email,
        username: user.username
    });
    
});




export default router;