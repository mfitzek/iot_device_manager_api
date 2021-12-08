


export interface DBObject<T>{
    id: any,
    object: T

    List(filter: any, limit: Number): DBObject<T>[],
    Get(id: any): DBObject<T>,
    Update(id: any, data: any): DBObject<T>,
    Insert(data: any): DBObject<T>
    Delete(id: any): DBObject<T>
}




export interface DBAdapater {

}