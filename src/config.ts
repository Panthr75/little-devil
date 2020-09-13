export type BotConfig = {
    /** The token for the bot */
    token: string,

    /** The client id of the bot */
    client_id: string,

    /** The secret for the client */
    secret: string,

    /** The version of the bot */
    version: string,

    /** The start status of the bot */
    startStatus: string,

    /** Whether or not the bot is enabled */
    enabled: boolean
};

/** The server config */
export type ServerConfig = {
    /** The port to run the server on */
    port: number,

    /** The url to redirect a user to once the oauth flow is successful */
    redirectURI: string,

    /** The scopes for the oauth. Is space seperated. Should at least contain `identify`*/
    scopes: string,

    /** Whether or not the server is enabled */
    enabled: boolean
};

export type Config = {
    /** The config for the bot */
    bot: BotConfig,

    /** The config for the server */
    server: ServerConfig,

    /** The firebase options */
    firebase: object
};

// @ts-ignore
if (global.config === undefined) {
    // @ts-ignore
    global.config = require("../config.json");
}

// @ts-ignore
let config: Config = global.config as Config;

export { config };

export default config;