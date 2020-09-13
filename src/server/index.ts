import express from "express";
import path from "path";
import HomeModel from "./models/Home";
import Logger from "../logger";
import SessionsDatabase from "../firebase/sessions";
import AuthModel from "./models/Auth";
import cookieparser from "cookie-parser";
import DashboardModel from "./models/Dashboard";

let logger = new Logger("SERVER", true, true, "debug");
logger.debug("TODO: store temporary session keys, and then change to permanent for 'auth' route: prevents abuse");

let sessionDB = new SessionsDatabase(global.fireStore);
let config = global.config;

let app = express();

let viewsPath = path.join(__dirname, "../../server-files/views");

app.set("view engine", "ejs");
app.set("views", viewsPath);

app.use(cookieparser());

app.use("/resources", express.static(path.join(__dirname, "../../server-files/resources")));

// load models
let home = new HomeModel(viewsPath, app, sessionDB);
let auth = new AuthModel(viewsPath, app, sessionDB);
let dashboard = new DashboardModel(viewsPath, app, sessionDB);

// start server
app.listen(config.server.port, () => {
    logger.info(`Server is online on port '${config.server.port}'`);
});