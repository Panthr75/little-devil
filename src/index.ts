import Firestore from "./firebase";
import config from "./config";
import { FileChangelog } from "./changelog";
import path from "path";

global.changelog = new FileChangelog(path.join(__dirname, "../changelog.json"), true);

global.fireStore = new Firestore(config.firebase);
global.config = config;

// idc that this is down here, global.fireStore needs to be set before bot is loaded
if (config.bot.enabled) {
    require("./bot/index");
}

if (config.server.enabled) {
    require("./server/index");
}