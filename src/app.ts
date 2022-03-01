import dotenv from "dotenv";
dotenv.config();

import express from "express";
import routes from "./routes/index_routes"

import device_manager from "./device/device_manager";



const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use(routes);


device_manager.InitManager();

export default app;

