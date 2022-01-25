import app from "./app"

import process from "process";


import { Gateway, ListenMQTT } from "./gateway/gateway";


const port = process.env.SERVER_PORT || 3000;

const server = app.listen(port, ()=>{
    console.log("Application listne on port: 3000");
});


function close_server(): void {
    server.close(()=>{
        console.log("Closing http server");
    });
}

/*
let gw = new Gateway();

let con: ListenMQTT = {
    protocol: "mqtt",
    uri: "mqtt://localhost:1883",
    topics: [
        {
            topic: "room/test2",
            name: "tester1",
            type: "number"
        }, 
        {
            topic: "bool",
            name: "booleanos",
            type: "boolean",
        },
        {
            topic: "obj",
            name: "objs",
            type: "object",
        },
        {
            topic: "room/*",
            name: "stringos",
            type: "string",
        },

    ]
}

gw.listen(con);

*/

process.on("SIGTERM", close_server);
process.on("SIGINT", close_server);
