import {IDevice} from "./device";
import {DBAdapater} from "../db_adapters/adapter.interface";






class DeviceManager {

    database: DBAdapater

    constructor(database: DBAdapater){
        this.database = database;
    }




}