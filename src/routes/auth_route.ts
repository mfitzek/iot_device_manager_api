import { Router } from "express";
import { hash, compare, hash } from "bcrypt";

import Database from "@/db/database";


const db = Database.Instance.prisma;


const router = Router();



router.post("/login", async (req, res, next)=>{
    const {email, password} = req.body;
    
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
            res.json({
                id: user.id,
                email: user.email,
                username: user.username
            });
            // TODO: save to session
        }else{
            res.json({
                error: "Wrong email address or password"
            });
        }
    }
});


router.post("/logout", async (req,res,next)=>{
    // TODO: Logout
});

router.post("/signup", async (req, res, next)=>{

    const {email, username, password} = req.body;

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
            message: "Email already exists"
        });
    }
    if(username_search){
        errors.push({
            property: "username",
            message: "Username already exists"
        });
    }

    if(errors.length > 0){
        res.json({errors: errors});
    }


    const user = await db.user.create({data: {
        username: username,
        email: email,
        password: await hash(password, 10)
    }});
    

    res.json({
        id: user.id,
        email: user.email,
        username: user.username
    });
    
});




export default router;