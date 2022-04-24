import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";


import routes from "./routes/index_routes"


import cors from "cors";




const app = express();
app.use(morgan("dev"));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use(routes);


export default app;

