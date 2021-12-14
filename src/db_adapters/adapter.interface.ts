import { IDevice } from "../device/device";


export interface DBObject<T>{

    List(filter: any, limit: Number): Promise<T[]>,
    Get(id: any): Promise<T>,
    Insert(data: any): Promise<T>
    Update(id: any, data: any): Promise<T>,
    Delete(id: any): Promise<T>
}


export interface IDBAdapater {
    Device: DBObject<IDevice>
}

