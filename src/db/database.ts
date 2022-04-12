import {  PrismaClient } from "@prisma/client";

import {spawn} from "child_process"

export default class Database{
    private static _instance: Database;

    public prisma: PrismaClient

    private constructor(){
        this.prisma = new PrismaClient();
    }

    public static get Instance(): Database{
        return this._instance || (this._instance = new Database());
    }
}

export async function backup_database(){
    const filename = process.env.SQLITE_FILE_NAME || "dev.db";
    const backup = spawn("sqlite3", [`prisma/${filename}`, ".backup backup/db.bak"]);

    const exitCode = await new Promise( (resolve) => {
        backup.on('close', resolve);
    });

    if(exitCode){
        throw new Error("Backup databasee process erorr");
    }

    return;
}

export async function restore_database(){
    const restore = spawn("sqlite3", [`prisma/${process.env.SQLITE_FILE_NAME || "dev.db"}`, ".restore backup/db.bak"]);

    const exitCode = await new Promise( (resolve) => {
        restore.on('close', resolve);
    });

    if(exitCode){
        throw new Error("Backup databasee process erorr");
    }

    return;
}

