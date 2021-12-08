import { IDevice } from "../device/device";


export interface DBObject<T>{

    List(filter: any, limit: Number): Promise<T[]>,
    Get(id: any): Promise<T>,
    Insert(data: any): Promise<T>
    Update(id: any, data: any): Promise<T>,
    Delete(id: any): Promise<T>
}


export interface DBAdapater {
    Device: DBObject<IDevice>
}