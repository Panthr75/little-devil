import LittleDevilClient from "./discord-wrappers/LittleDevilClient";

let botClient = new LittleDevilClient(global.fireStore, global.config.bot);

botClient.init();

global.client = botClient;


//logger.warn("A language translater should be used for commands. For example, instead of sending 'successfully banned user', add `translator.getLanguage(guild_data.options.language).ban.success(user)`");