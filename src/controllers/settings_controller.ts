import { Request, Response } from "express"
import { backup_database, restore_database } from "@/db/database";
import AdmZip from "adm-zip";

import moment from "moment";
import device_manager from "@/device/device_manager";




export default {

    async backup(req: Request, res: Response){
        try {
            await backup_database();

            const zip = new AdmZip();
            zip.addLocalFile("backup/db.bak");
            
            const filename = `${moment().format("YYYY-MM-DDTHH-mm-ss")}.zip`;
           /* 
            await zip.writeZipPromise(filename);

            res.download(filename, async (err)=>{
                if(err){
                    console.log(err);
                }
                await unlink(filename);
            });*/

            const data = await zip.toBufferPromise();

            res.set("Conternt-Type", "application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip");
            res.set("Content-Disposition", `attachment; filename=${filename}`);
            res.set("Content-Length", data.length.toString());
            res.send(data);



        } catch (error) {
            console.log(error);
            res.status(500).send("failed");        
        }
    },


    async restore(req: Request, res: Response){

        const zip = new AdmZip(req.file?.buffer);
        zip.extractEntryTo("db.bak", "backup", false, true);
        await restore_database();
        await device_manager.InitManager();


        res.send("ok");
    }

}