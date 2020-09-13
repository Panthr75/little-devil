import { Client } from "discord.js";
import { GuildData } from "../../firebase/index";
import { DiscordMessage } from "../discord-wrappers/DiscordMessage";
import Logger from "../../logger";
import Translations from "../../translations";

/**
 * The permission level. Used for commands. The current PermissionLevels are:
 * - `"none"` - The user has no special permissions
 * - `"moderator"` - Requires moderator permissions (User must be a bot moderator [managed via `addmod` and `delmod` commands])
 * - `"bot-admin"` - Requires `MANAGE_SERVER` permissions. 
 * - `"server-admin"` - User has `ADMINISTRATOR` permissions
 * - `"server-owner"` - The user is the owner of the guild/server
 * - `"little-devil"` - Little Devil's permission level
 * - `"bot-owner"` - The user is the owner of Little Devil
 */
export type PermissionLevel = "none" | "moderator" | "bot-admin" | "server-admin" | "server-owner" | "little-devil" | "bot-owner";

/** Cooldown info */
export type CooldownInfo = {
    /** The number of days */
    days: number,
    /** The number of hours */
    hours: number,
    /** The number of minutes */
    minutes: number,
    /** The number of seconds */
    seconds: number
}

/** The help info of a command */
export type HelpInfo = {
    /** The description of the command */
    description: string,
    /** The usage of the command */
    usages: HelpInfoUsage[],
    /** The examples of using this command */
    examples: HelpInfoExample[]
}

/** The usage of the command */
export type HelpInfoUsage = {
    /**
     * The info of this specific usage. Please note that the following
     * will be replaced:
     * * `{n}` - The `n`th paramater's name
     */
    info: string

    /**
     * The parameters for this usage
     */
    parameters: HelpInfoUsageParameter[]
}

/** The parameter of the usage for the usage */
export type HelpInfoUsageParameter = {
    /** Whether or not this parameter is an argument list */
    isList: boolean,

    /** Whether or not this parameter is optional */
    optional: boolean,

    /** The default value if this parameter is optional */
    defaultValue?: string,

    /** The name of this parameter */
    name: string,

    /** The info about this parameter */
    info: string
}

/** An example of using the command */
export type HelpInfoExample = {
    /** 
     * The raw message that was fed in. Please note that the following
     * will be replaced:
     * * `{prefix}` - The current prefix
     * * `{command}` - The command that was used for the help command
     */
    raw_message: string,

    /**
     * The info of this command. May be a response, or just generally 
     * info of what happens
     */
    info: string,

    /** Whether or not the raw message is the full message. Defaults to `false` */
    raw_message_full?: boolean
}

/** Represents a command on Discord */
export default abstract class DiscordCommand {
    
    private static _commands: DiscordCommand[] = [];
    protected static get commands(): DiscordCommand[] {
        return this._commands.slice();
    }

    private readonly _id: string;
    private readonly _aliases: string[];
    private readonly _logger: Logger;

    /**
     * Whether or not this command is nsfw (not safe for work)
     * @virtual
     */
    public get nsfw(): boolean {
        return false;
    }

    /** The id of this command */
    public get id(): string {
        return this._id;
    }

    /** The aliases for this command */
    public get aliases(): string[] {
        return this._aliases.slice();
    }

    /** Gets the logger for this command */
    public get logger(): Logger {
        return this._logger;
    }

    /** The permission level of this command */
    public abstract get permissionLevel(): PermissionLevel;

    /** Can this command be used inside direct messages/group dms? */
    public abstract get allowInDMS(): boolean;

    /** Can this command be used inside servers? */
    public abstract get allowInServers(): boolean;

    /** Can this command be used inside servers? */
    public abstract get exactPermissionLevel(): boolean;

    /** The help info for this command */
    public abstract get helpInfo(): HelpInfo;

    /**
     * Initializes a new discord command
     * @param id The ID of the command
     * @param aliases The aliases for this command
     */
    public constructor(id: string, ...aliases: string[]) {
        this._id = id;
        this._aliases = aliases;
        DiscordCommand._commands.push(this);
        this._logger = new Logger(`BOT~${id.toUpperCase()}-CMD`, true, true, "debug");
    }

    /**
     * Runs the command
     * @param message The message
     */
    public abstract run(message: DiscordMessage): void;

    /**
     * Whether or not this command requires the prefix
     * @param message The message
     */
    public abstract needsPrefix(message: DiscordMessage): boolean;

    /**
     * Whether or not this command has the alias/id equal to the given id.
     * @param id The command id to test
     */
    public equals(id: string): boolean;

    /**
     * Whether or not this command has the an alias/id that matches the give command
     * @param command The command to test
     */
    public equals(command: DiscordCommand): boolean;

    public equals(command: string | DiscordCommand): boolean {
        if (typeof command === "string") {
            return this.id === command || this.aliases.includes(command);
        }
        else {
            let idsToTest = [command.id].concat(command.aliases);
            for (let id of idsToTest) {
                if (this.id === id || this.aliases.includes(id)) return true;
            }
            return false;
        }
    }

    public translate(languageOrGuildData: string | GuildData, path: string, ...args: any[]): string {
        let language: string;
        if (typeof languageOrGuildData === "string") {
            language = languageOrGuildData;
        }
        else {
            language = languageOrGuildData.options.language;
        }

        try {
            return Translations.getWithLang(language, path, ...args);
        }
        catch(err) {
            return path;
        }
    }

    public static translate(languageOrGuildData: string | GuildData, path: string, ...args: any[]): string {
        let language: string;
        if (typeof languageOrGuildData === "string") {
            language = languageOrGuildData;
        }
        else {
            language = languageOrGuildData.options.language;
        }

        try {
            return Translations.getWithLang(language, path, ...args);
        }
        catch(err) {
            return path;
        }
    }
}