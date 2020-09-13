import { PermissionLevel, CooldownInfo } from "../bot/commands/DiscordCommand";
import { WorkCommandMessage } from "../bot/commands/WorkCommand";

import * as admin from "firebase-admin";

//#region Guild Data

/** The firestore data for a guild */
export type GuildData = {
    /** The options of the guild */
    options: GuildOptions,
    /** The user data of the guild, where the key is the user's id */
    userdata: {
        [x: string]: GuildUserData
    }
}

export type FullGuildData = {
    [x: string]: GuildData
}

//#region Guild User Data

export type GuildUserData = {
    /** The user data for the server's economy */
    economy: GuildUserEconomyData,
    /** The user data for the server's moderation */
    moderation: GuildUserModerationData
}

export type GuildUserEconomyData = {
    /** The current daily streak for this user */
    dailyStreak: number,
    /** The highest daily streak this user has accomplished */
    highestDailyStreak: number,
    /** The timestamp in milliseconds at which the daily money was collected */
    dailyTS: number,
    /** The money this user has */
    money: number,
    /** The timestamp in milliseconds at which the work command was used */
    workTS: number
}

export type GuildUserModerationData = {
    /** The warnings the user has */
    warnings: GuildWarning[]
}

export type GuildWarning = {
    /** The reason for the warn */
    reason: string,
    /** The timestamp of the warn */
    timestamp: number,
    /** The guild warner who warned the user */
    warnedBy: GuildWarner
}

export type GuildWarner = {
    /** The id of the user */
    id: string,
    /** The username of the user (when the warnee was warned) */
    username: string
}

//#endregion

//#region Guild Options Data

/** The options for a guild */
export type GuildOptions = {
    /** The language of the guild. Defaults to "en" */
    language: string,
    /** The prefix for the server. Defaults to "$" */
    prefix: string,
    /** The list of user id's that are moderators of this server */
    mods: string[],
    /** The list of banned words users are not allowed to say on the server */
    bannedWords: string[],
    /** A list of reaction restrictions */
    reactionRestrictions: ReactionRestrictionOptions[],
    /** The member action message options for this guild */
    memberActions: GuildMemberActionsOptions,
    /** The economy of this server */
    economy: GuildEconomyOptions,
    /** The logging options for this guild */
    logging: GuildLoggingOptions
}

export type ReactionRestrictionOptions = {
    /** The id of the emoji to restrict */
    emoji_id: string,
    /** Whether to remove the reaction if the user has the the user permission. If true and they have the permission level, it removes the reaction. If false and they don't have the permission level, it removes the reaction */
    remove_if_has_permission: boolean,
    /** The permission level */
    permission_level: PermissionLevel
}

export type GuildMemberActionsOptions = {
    /** Is Join And Leave Messages Enabled? */
    enabled: boolean,
    /** The join section options */
    join: GuildMemberActionsSection,
    /** The leave section options */
    leave: GuildMemberActionsSection
}

export type GuildMemberActionsSection = {
    /** Is this section enabled */
    enabled: boolean,
    /** The channel ID the message should be sent to */
    channel: string,
    /** The action message */
    message: string
}

//#region Guild Economy Options

export type GuildEconomyOptions = {
    /** Is economy enabled on this server? */
    enabled: boolean,
    /** This server's currency. */
    currency: GuildEconomyCurrencyOptions,
    /** The options for the daily command. */
    dailyCommand: GuildEconomyDailyCommandOptions,
    /** The options for the work command. */
    workCommand: GuildEconomyWorkCommandOptions
}

export type GuildEconomyCurrencyOptions = {
    /** The symbol of the server's currency. Defaults to "$" */
    symbol: string,
    /** The name of the currency. Defaults to "Dollar" */
    name: string,
    /** The plural name of the currency. Defaults to "Dollars" */
    pluralName: string
}

export type GuildEconomyDailyCommandOptions = {
    /** Is the daily command enabled on this server? */
    enabled: boolean,
    /** The base amount of money users earn for using the daily command */
    dailyAmount: number,
    /** The multiplier to multiply the base amount each day for a "streak" bonus */
    dailyMultiplier: number,
    /** The streak day at which any further days will not increase the multiplier */
    dailyMultiplierEnd: number
}

export type GuildEconomyWorkCommandOptions = {
    /** Is the work command enabled on this server? */
    enabled: boolean,
    /** The minimum amount of money you can get from working */
    workMinMoney: number,
    /** The maximum amount of money you can get from working */
    workMaxMoney: number,
    /** The cooldown of using the work command */
    workCooldown: CooldownInfo,
    /** The messages that get randomly chosen whenever you work */
    workMessages: WorkCommandMessage[]
}

export type GuildEconomyShopOptions = {
    /** Is the shop enabled on this server? */
    enabled: boolean,
    /** The items available in this shop */
    items: GuildEconomyShopItem[]
}

export type GuildEconomyShopItem = {
    /** The type of shop item this is */
    type: GuildEconomyShopItemType,
    /** The name to display in the shop */
    displayName: string,
    /** The cost of this item */
    cost: number,
    /** The id of the role this shop item is for if the `type` is `role` */
    roleID: string,
    /** The id of the item this shop item is for if the `type` is `item` */
    itemID: string
}

/**
 * The type of shop item this is:
 * * `role` — This shop item is a role
 * * `item` — This shop item is an item
 */
export type GuildEconomyShopItemType = "role" | "item";

//#endregion

//#region Guild Logging Options

export type GuildLoggingOptions = {
    /** The ban logging options */
    ban: GuildBanLoggingOptions,
    /** The channel logging options */
    channel: GuildChannelLoggingOptions,
    /** The emoji logging options */
    emoji: GuildEmojiLoggingOptions,
    /** The member logging options */
    member: GuildMemberLoggingOptions,
    /** The message logging options */
    message: GuildMessageLoggingOptions,
    /** The role logging options */
    role: GuildRoleLoggingOptions,
    /** The reaction logging options */
    reaction: GuildReactionLoggingOptions,
    /** Whether this bot and other bot's actions should be logged */
    log_bots: boolean,
    /** The id of the log channel */
    log_channel?: string
}

export type GuildBanLoggingOptions = {
    /** Log when a member gets banned */
    add: boolean,
    /** Log when a member gets unbanned */
    remove: boolean
}

export type GuildChannelLoggingOptions = {
    /** Log when a new channel is created */
    create: boolean,
    /** Log when a channel is deleted */
    delete: boolean
}

export type GuildEmojiLoggingOptions = {
    /** Log when a new emoji is created */
    create: boolean,
    /** Log when an emoji is updated */
    update: boolean
    /** Log when an emoji is deleted */
    delete: boolean,
}

export type GuildMemberLoggingOptions = {
    /** Log when a member joins the guild */
    join: boolean,
    /** Log when a member leaves the guild */
    leave: boolean
}

export type GuildMessageLoggingOptions = {
    /** Log when a message is deleted */
    delete: boolean,
    /** Log when a message is edited */
    edit: boolean
}

export type GuildRoleLoggingOptions = {
    /** Log when a new role is created */
    create: boolean,
    /** Log when a role is updated */
    update: boolean,
    /** Log when a role is deleted */
    delete: boolean
}

export type GuildReactionLoggingOptions = {
    /** Log when automod removes a reaction */
    automod_remove: boolean
}

//#endregion

//#endregion

//#endregion

//#region User Data

export type UserData = {
    /** Whether or not NSFW content is allowed in DMS with this user */
    allowNSFW: boolean,
    /** The type of user of this data */
    userType: UserDataUserType,
    /** The time the user joined the Little Devil Account System */
    joinedAt: number
};

/**
 * The type of user for this user data:
 * * `"default"` - The default user
 * * `"premium"` - This user has premium
 * * `"owner"` - This user is the bot owner
 */
export type UserDataUserType = "default" | "premium" | "owner";

export type FullUserData = {
    [x: string]: UserData
};

//#endregion

export default class Firestore {

    public guildData: FullGuildData;
    public userData: FullUserData;

    private _ready: boolean;

    /** Whether or not the firestore is ready */
    public get ready(): boolean {
        return this._ready;
    }

    /** The raw firestore */
    private _firestore: FirebaseFirestore.Firestore;

    /**
     * Instantiates a new firestore
     * @param credentials The credentials of the account
     */
    public constructor(credentials: any) {
        this.guildData = {};
        this.userData = {};
        this._ready = false;

        admin.initializeApp({
            credential: admin.credential.cert(credentials)
        });

        let firestore = admin.firestore();

        firestore.collection("guilddata").onSnapshot((snapshot) => {
            let fullData: { [x: string]: any } = {};

            snapshot.forEach(doc => fullData[doc.id] = doc.data());

            this.guildData = fullData as FullGuildData;

            if (!this._ready) {
                this._ready = true;
                this.updateGuilds();
            }
        });

        firestore.collection("userdata").onSnapshot((snapshot) => {
            let fullData: { [x: string]: any } = {};

            snapshot.forEach(doc => fullData[doc.id] = doc.data());

            this.userData = fullData as FullUserData;
        });

        this._firestore = firestore;
    }

    /**
     * Gets the guild data from the given guild id
     * @param guildID The id of the guild to get the data from
     */
    public async getGuildData(guildID: string): Promise<GuildData>;

    /**
     * Gets the guild data from the given guild id, with the option of attempting to fetch from the existing data first
     * @param guildID The id of the guild to get the data from
     * @param fetch Whether or not to do a raw fetch to the database, or attempt to look at existing data first
     */
    public async getGuildData(guildID: string, fetch: boolean): Promise<GuildData>;

    /**
     * Gets the guild data from the given guild id, running the given callback function
     * @param guildID The id of the guild to get the data from
     * @param callback The callback function. First parameter is whether or not getting the data was successful. Second parameter is the actual data.
     */
    public async getGuildData(guildID: string, callback: (successful: boolean, data: GuildData) => any): Promise<GuildData>;

    /**
     * Gets the guild data from the given guild id, with the option of attempting to fetch from the existing data first, running the given callback function
     * @param guildID The id of the guild to get the data from
     * @param fetch Whether or not to do a raw fetch to the database, or attempt to look at existing data first
     * @param callback The callback function. First parameter is whether or not getting the data was successful. Second parameter is the actual data.
     */
    public async getGuildData(guildID: string, fetch: boolean, callback: (successful: boolean, data: GuildData) => any): Promise<GuildData>;

    public async getGuildData(guildID: string, fetch: boolean | ((successful: boolean, data: GuildData) => any) = true, callback?: (successful: boolean, data: GuildData) => any): Promise<GuildData> {
        if (typeof fetch !== "boolean") { 
            callback = fetch;
            fetch = true;
        }

        if (!fetch) {
            let existingData = this.guildData[guildID];
            if (existingData !== undefined) {
                if (callback !== undefined) callback(true, existingData);
                return existingData;
            }
        }

        let guildEntries = await this._firestore.collection("guilddata").get();

        let data: GuildData | undefined = undefined;

        guildEntries.forEach(guildEntry => {
            if (guildEntry.id === guildID) {
                data = guildEntry.data() as GuildData;
            }
        });

        if (data === undefined) {
            if (callback === undefined) throw new Error("No guild found!");
            else {
                data = {} as GuildData;
                callback(false, data);
                return data; 
            }
        }
        else {
            if (callback !== undefined) callback(true, data);
            return data;
        }
    }

    /**
     * Gets the user data from the given user id
     * @param userID The id of the user to get the data from
     */
    public async getUserData(userID: string): Promise<UserData>;

    /**
     * Gets the user data from the given user id, with the option of attempting to fetch from the existing data first
     * @param userID The id of the user to get the data from
     * @param fetch Whether or not to do a raw fetch to the database, or attempt to look at existing data first
     */
    public async getUserData(userID: string, fetch: boolean): Promise<UserData>;

    /**
     * Gets the user data from the given user id, running the given callback function
     * @param userID The id of the user to get the data from
     * @param callback The callback function. First parameter is whether or not getting the data was successful. Second parameter is the actual data.
     */
    public async getUserData(userID: string, callback: (successful: boolean, data: UserData) => any): Promise<UserData>

    /**
     * Gets the user data from the given user id, with the option of attempting to fetch from the existing data first, running the given callback function
     * @param userID The id of the user to get the data from
     * @param fetch Whether or not to do a raw fetch to the database, or attempt to look at existing data first
     * @param callback The callback function. First parameter is whether or not getting the data was successful. Second parameter is the actual data.
     */
    public async getUserData(userID: string, fetch: boolean, callback: (successful: boolean, data: UserData) => any): Promise<UserData>;

    public async getUserData(userID: string, fetchOrCallback: boolean | ((successful: boolean, data: UserData) => any) = false, callback?: (successful: boolean, data: UserData) => any): Promise<UserData> {
        let fetch: boolean;

        if (typeof fetchOrCallback !== "boolean") {
            callback = fetchOrCallback;
            fetch = true;
        }
        else {
            fetch = fetchOrCallback;
        }

        if (!fetch) {
            let existingData = this.userData[userID];
            if (existingData !== undefined) {
                if (callback !== undefined) callback(true, existingData);
                return existingData;
            }
        }

        let userEntries = await this._firestore.collection("userdata").get();

        let data: UserData | undefined = undefined;

        userEntries.forEach(userEntry => {
            if (userEntry.id === userID) {
                data = userEntry.data() as UserData;
            }
        });

        if (data === undefined) {
            if (callback === undefined) throw new Error("No userdata found!");
            else {
                data = {} as UserData;
                callback(false, data);
                return data;
            }
        }
        else {
            if (callback !== undefined) callback(true, data);
            return data;
        }
    }

    /**
     * Sets the guild data for the given guild id.
     * @param guildID The id of the guild to set the data for
     * @param guildData The data to set for the guild
     */
    public setGuildData(guildID: string, guildData: GuildData): Promise<boolean>

    /**
     * Sets the guild data for the given guild id, and runs the given callback function
     * @param guildID The id of the guild to set the data for
     * @param guildData The data to set for the guild
     * @param callback The callback function. First parameter is boolean, indicating whether or not setting the data was successful
     */
    public setGuildData(guildID: string, guildData: GuildData, callback: (successful: boolean) => any): Promise<boolean>

    public setGuildData(guildID: string, guildData: GuildData, callback?: (successful: boolean) => any): Promise<boolean> {
        return new Promise((resolve) => {
            this._firestore.collection("guilddata").doc(guildID).set(guildData as FirebaseFirestore.DocumentData)
                .then(() => {
                    if (callback !== undefined) callback(true);
                    resolve(true);
                })
                .catch(() => {
                    if (callback !== undefined) callback(false);
                    resolve(false);
                });
        });
    }

    /**
     * Sets the user data for the given user id.
     * @param userID The id of the user to set the data for
     * @param userData The data to set for the user
     */
    public setUserData(userID: string, userData: UserData): Promise<boolean>

    /**
     * Sets the user data for the given user id, and runs the given callback function
     * @param userID The id of the user to set the data for
     * @param userData The data to set for the user
     * @param callback The callback function. First parameter is boolean, indicating whether or not setting the data was successful
     */
    public setUserData(userID: string, userData: UserData, callback: (successful: boolean) => any): Promise<boolean>

    public setUserData(userID: string, userData: UserData, callback?: (successful: boolean) => any): Promise<boolean> {
        return new Promise((resolve) => {
            this._firestore.collection("userdata").doc(userID).set(userData as FirebaseFirestore.DocumentData)
                .then(() => {
                    if (callback !== undefined) callback(true);
                    resolve(true);
                })
                .catch(() => {
                    if (callback !== undefined) callback(false);
                    resolve(false);
                });
        });
    }

    /**
     * Deletes the guild data from the given guild id
     * @param guildID The ID of the guild wanted to be deleted
     * @returns A promise resolved with the result of writing to the database
     */
    public deleteGuildData(guildID: string): Promise<boolean>;

    /**
     * Deletes the guild data from the given guild id
     * @param guildID The ID of the guild wanted to be deleted
     * @param callback The callback function to run for the result
     * @returns A promise resolved with the result of writing to the database
     */
    public deleteGuildData(guildID: string, callback: (successful: boolean) => any): Promise<boolean>;
    
    public deleteGuildData(guildID: string, callback?: (successful: boolean) => any): Promise<boolean> {
        delete this.guildData[guildID];
        return new Promise((resolve) => {
            this._firestore.collection("guilddata").doc(guildID).delete()
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    resolve(false);
                })
        });
    }

    /** Gets the default guild data */
    public defaultGuildData(): GuildData {
        return {
            "userdata": {},
            "options": this.defaultGuildDataOptions()
        };
    }

    /** Gets the default guild data options */
    public defaultGuildDataOptions(): GuildOptions {
        return {
            "language": "en",
            "prefix": "$",
            "reactionRestrictions": [],
            "logging": {
                "log_bots": true,
                "log_channel": undefined,
                "channel": {
                    "create": true,
                    "delete": true
                },
                "emoji": {
                    "create": true,
                    "delete": true,
                    "update": true
                },
                "ban": {
                    "add": true,
                    "remove": true
                },
                "member": {
                    "join": true,
                    "leave": true
                },
                "message": {
                    "edit": true,
                    "delete": true
                },
                "reaction": {
                    "automod_remove": true
                },
                "role": {
                    "create": true,
                    "update": true,
                    "delete": true
                }
            },
            "economy": {
                "enabled": true,
                "currency": {
                    "name": "Dollar",
                    "pluralName": "Dollars",
                    "symbol": "$"
                },
                "workCommand": {
                    "enabled": true,
                    "workMinMoney": 50,
                    "workMaxMoney": 175,
                    "workCooldown": {
                        "days": 0,
                        "hours": 0,
                        "minutes": 10,
                        "seconds": 0
                    },
                    "workMessages": [
                        "You worked and got {money}"
                    ]
                },
                "dailyCommand": {
                    "enabled": true,
                    "dailyAmount": 500,
                    "dailyMultiplier": 1.5,
                    "dailyMultiplierEnd": 10
                }
            },
            "memberActions": {
                "enabled": false,
                "join": {
                    "enabled": false,
                    "channel": "",
                    "message": ""
                },
                "leave": {
                    "enabled": false,
                    "channel": "",
                    "message": ""
                }
            },
            "mods": [],
            "bannedWords": []
        }
    }

    /** Gets the default guild user data */
    public defaultGuildUserData(): GuildUserData {
        return {
            "economy": {
                "dailyStreak": 0,
                "dailyTS": 0,
                "highestDailyStreak": 0,
                "money": 0,
                "workTS": 0
            },
            "moderation": {
                "warnings": []
            }
        };
    }

    /** Gets the default user data */
    public defaultUserData(): UserData {
        return {
            "allowNSFW": false,
            "userType": "default",
            "joinedAt": Date.now()
        };
    }

    /** Updates all guild data so no properties are undefined */
    public updateGuilds(): void {
        let guildData = this.guildData;
        let keys = Object.keys(guildData);
        for (let index = 0, length = keys.length; index < length; index++) {
            let key = keys[index], data = guildData[key];
            guildData[key] = this._updateGuildData(data);
            this.setGuildData(key, data);
        }
    }

    private _updateGuildData(data: GuildData): GuildData {
        let def = this.defaultGuildData();

        if (data.options === undefined) data.options = def.options;
        else data.options = this._updateGuildOptions(data.options, def.options);

        if (data.userdata === undefined) data.userdata = def.userdata;
        else {
            let keys = Object.keys(data.userdata);
            for (let index = 0, length = keys.length; index < length; index++) {
                let key = keys[index];
                let userData: GuildUserData = data.userdata[key];
                data.userdata[key] = this._updateGuildUserData(userData);
            }
        }
        return data;
    }

    private _updateGuildUserData(data: GuildUserData): GuildUserData {
        let def = this.defaultGuildUserData();

        if (data.economy === undefined) {
            data.economy = def.economy;
        }
        else {
            let economyData = data.economy, defEconomyData = def.economy;

            if (economyData.dailyStreak === undefined) economyData.dailyStreak = defEconomyData.dailyStreak;
            if (economyData.dailyTS === undefined) economyData.dailyTS = defEconomyData.dailyTS;
            if (economyData.highestDailyStreak === undefined) economyData.highestDailyStreak = defEconomyData.highestDailyStreak;
            if (economyData.money === undefined) economyData.money = defEconomyData.money;
            if (economyData.workTS === undefined) economyData.workTS = defEconomyData.workTS;
        }

        if (data.moderation === undefined) {
            data.moderation = def.moderation;
        }
        else {
            let moderationData = data.moderation, defModerationData = def.moderation;

            if (moderationData.warnings === undefined) moderationData.warnings = defModerationData.warnings;
        }

        return data;
    }

    private _updateGuildOptions(
        options: GuildOptions,
        defOptions: GuildOptions = this.defaultGuildDataOptions()
    ): GuildOptions {
        if (options.bannedWords === undefined) options.bannedWords = defOptions.bannedWords;
        if (options.economy === undefined) options.economy = defOptions.economy;
        else options.economy = this._updateGuildEconomy(options.economy, defOptions.economy);
        if (options.language === undefined) options.language = defOptions.language;
        if (options.logging === undefined) options.logging = defOptions.logging;
        else options.logging = this._updateLogging(options.logging, defOptions.logging);
        if (options.memberActions === undefined) options.memberActions = defOptions.memberActions;
        else options.memberActions = this._updateMemberActions(options.memberActions, defOptions.memberActions);
        if (options.mods === undefined) options.mods = defOptions.mods;
        if (options.prefix === undefined) options.prefix = defOptions.prefix;
        if (options.reactionRestrictions === undefined) options.reactionRestrictions = defOptions.reactionRestrictions;

        return options;
    }

    private _updateGuildEconomy(
        economy: GuildEconomyOptions, 
        defEconomy: GuildEconomyOptions = this.defaultGuildDataOptions().economy
    ): GuildEconomyOptions {
        if (economy.currency === undefined || typeof economy.currency !== "object") economy.currency = defEconomy.currency;
        else economy.currency = this._updateGuildCurrency(economy.currency, defEconomy.currency);

        if (economy.dailyCommand === undefined) economy.dailyCommand = defEconomy.dailyCommand;
        else economy.dailyCommand = this._updateDailyCommand(economy.dailyCommand, defEconomy.dailyCommand);

        if (economy.enabled === undefined) economy.enabled = defEconomy.enabled;

        if (economy.workCommand === undefined) economy.workCommand = defEconomy.workCommand;
        else economy.workCommand = this._updateWorkCommand(economy.workCommand, defEconomy.workCommand);

        return economy;
    }

    private _updateGuildCurrency(
        currency: GuildEconomyCurrencyOptions, 
        defCurrency: GuildEconomyCurrencyOptions = this.defaultGuildDataOptions().economy.currency
    ): GuildEconomyCurrencyOptions {
        if (currency.name === undefined) currency.name = defCurrency.name;
        if (currency.pluralName === undefined) currency.pluralName = defCurrency.pluralName;
        if (currency.symbol === undefined) currency.symbol = defCurrency.symbol;
        return currency;
    }

    private _updateDailyCommand(
        dailyCommand: GuildEconomyDailyCommandOptions,
        defDailyCommand: GuildEconomyDailyCommandOptions = this.defaultGuildDataOptions().economy.dailyCommand
    ): GuildEconomyDailyCommandOptions {
        if (dailyCommand.dailyAmount === undefined) dailyCommand.dailyAmount = defDailyCommand.dailyAmount;
        if (dailyCommand.dailyMultiplier === undefined) dailyCommand.dailyMultiplier = defDailyCommand.dailyMultiplier;
        if (dailyCommand.dailyMultiplierEnd === undefined) dailyCommand.dailyMultiplierEnd = defDailyCommand.dailyMultiplierEnd;
        if (dailyCommand.enabled === undefined) dailyCommand.enabled = defDailyCommand.enabled;

        return dailyCommand;
    }

    private _updateWorkCommand(
        workCommand: GuildEconomyWorkCommandOptions,
        defWorkCommand: GuildEconomyWorkCommandOptions = this.defaultGuildDataOptions().economy.workCommand
    ): GuildEconomyWorkCommandOptions {
        if (workCommand.enabled === undefined) workCommand.enabled = defWorkCommand.enabled;
        if (workCommand.workCooldown === undefined) workCommand.workCooldown = defWorkCommand.workCooldown;
        if (workCommand.workMaxMoney === undefined) workCommand.workMaxMoney = defWorkCommand.workMaxMoney;
        if (workCommand.workMessages === undefined) workCommand.workMessages = defWorkCommand.workMessages;
        if (workCommand.workMinMoney === undefined) workCommand.workMinMoney = defWorkCommand.workMinMoney;

        return workCommand;
    }

    private _updateLogging(
        logging: GuildLoggingOptions,
        defLogging: GuildLoggingOptions = this.defaultGuildDataOptions().logging
    ): GuildLoggingOptions {
        if (logging.ban === undefined) logging.ban = defLogging.ban;
        else logging.ban = this._updateLoggingOption(logging.ban, defLogging.ban);
        if (logging.channel === undefined) logging.channel = defLogging.channel;
        else logging.channel = this._updateLoggingOption(logging.channel, defLogging.channel);
        if (logging.emoji === undefined) logging.emoji = defLogging.emoji;
        else logging.emoji = this._updateLoggingOption(logging.emoji, defLogging.emoji);
        if (logging.log_bots === undefined) logging.log_bots = defLogging.log_bots;
        if (logging.log_channel === undefined) logging.log_channel = defLogging.log_channel;
        if (logging.member === undefined) logging.member = defLogging.member;
        else logging.member = this._updateLoggingOption(logging.member, defLogging.member);
        if (logging.message === undefined) logging.message = defLogging.message;
        else logging.message = this._updateLoggingOption(logging.message, defLogging.message);
        if (logging.reaction === undefined) logging.reaction = defLogging.reaction;
        else logging.reaction = this._updateLoggingOption(logging.reaction, defLogging.reaction);
        if (logging.role === undefined) logging.role = defLogging.role;
        else logging.role = this._updateLoggingOption(logging.role, defLogging.role);

        return logging;
    }

    private _updateLoggingOption<T>(logOption: T, defOptions: T): T {
        let keys = Object.keys(defOptions);
        for (let index = 0, length = keys.length; index < length; index++) {
            let key = keys[index] as keyof typeof defOptions;
            if (logOption[key] === undefined) logOption[key] = defOptions[key];
        }
        return logOption;
    }

    private _updateMemberActions(
        actions: GuildMemberActionsOptions,
        defActions: GuildMemberActionsOptions = this.defaultGuildDataOptions().memberActions
    ): GuildMemberActionsOptions {
        if (actions.enabled === undefined) actions.enabled = defActions.enabled;
        if (actions.join === undefined) actions.join = this._updateMemberActionSection(actions.join, defActions.join);
        if (actions.leave === undefined) actions.leave = this._updateMemberActionSection(actions.leave, defActions.leave);
        
        return actions;
    }

    private _updateMemberActionSection(
        section: GuildMemberActionsSection,
        defSection: GuildMemberActionsSection
    ): GuildMemberActionsSection {
        if (section.channel === undefined) section.channel = defSection.channel;
        if (section.enabled === undefined) section.enabled = defSection.enabled;
        if (section.message === undefined) section.message = defSection.message;

        return section;
    }
}