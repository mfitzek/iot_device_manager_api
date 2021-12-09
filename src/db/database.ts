
import {DBObject, IDBAdapater} from "../db_adapters/adapter.interface";
import { IDevice } from "../device/device";



export default class Database{

    adapter: IDBAdapater;

    constructor(adapter: IDBAdapater){
        this.adapter = adapter;
    }

}


