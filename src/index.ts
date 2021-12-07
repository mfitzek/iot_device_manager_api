import app from "./app"

import process from "process";

const port = process.env.SERVER_PORT || 3000;

const server = app.listen(port, ()=>{
    console.log("Application listne on port: 3000");
});


function close_server(): void {
    server.close(()=>{
        console.log("Closing http server");
    });
}



process.on("SIGTERM", close_server);
process.on("SIGINT", close_server);
