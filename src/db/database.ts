import {  PrismaClient } from "@prisma/client";


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



