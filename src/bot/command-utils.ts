import DiscordCommand, { CooldownInfo, PermissionLevel } from "./commands/DiscordCommand";
import { GuildMember, Guild, NewsChannel, DMChannel, TextChannel, User, Permissions, PermissionString, GuildChannel, Channel } from "discord.js";
import { GuildEconomyCurrencyOptions, UserData } from "../firebase";

let config = require("../../config.json");

/** A list of all permission levels in index of lowest to highest */
export const PERMISSIONS: ReadonlyArray<PermissionLevel> = Object.freeze([
    "none",
    "moderator",
    "bot-admin",
    "server-admin",
    "server-owner",
    "little-devil",
    "bot-owner"
]);

export const BOT_OWNERS: ReadonlyArray<string> = Object.freeze([
    "296750507048042496"
]);

export const CUSTOM_EMOJIS = Object.freeze({
    "redtick": "<:redtick:712035103412584578>",
    "greentick": "<:greentick:712035079614103582>"
} as {
    [x: string]: string | undefined,
    redtick: string,
    greentick: string
});

let fireStore = global.fireStore;

export type PluralFormat = {
    type: PluralType,
    format: PluralFormatType
};

export type PluralType = "add-s";

export type PluralFormatType = "amount-word"

export function pluralize(amount: number, word: string, format: PluralFormat): string {
    if (format.type === "add-s") {
        if (amount !== 1) word += "s";
    }

    if (format.format === "amount-word") {
        let result = amount.toString() + " " + word;
        return result;
    }
    return "";
}

export function generateTimeLeft(time: number): CooldownInfo {
    let ms = time % 1000;
    time = (time - ms) / 1000;

    let seconds = time % 60;
    time = (time - seconds) / 60;
    
    let minutes = time % 60;
    time = (time - minutes) / 60;

    let hours = time % 60;
    time = (time - hours) / 60;

    let days = (time - hours) / 24;

    return {
        "days": days,
        "hours": hours,
        "minutes": minutes,
        "seconds": seconds
    };
}

export function cooldownInfoToString(info: CooldownInfo): string {
    let {
        days,
        hours,
        minutes,
        seconds
    } = info;

    let timeParts = [];

    if (days > 0) timeParts.push(pluralize(days, "day", { format: "amount-word", type: "add-s" }));
    if (hours > 0) timeParts.push(pluralize(hours, "hour", { format: "amount-word", type: "add-s" }));
    if (minutes > 0) timeParts.push(pluralize(minutes, "minute", { format: "amount-word", type: "add-s" }));
    if (seconds > 0) timeParts.push(pluralize(seconds, "second", { format: "amount-word", type: "add-s" }));

    if (timeParts.length === 0) return "1 second";
    else return insertCommaAnd(timeParts);
}

export function insertCommaAnd(parts: string[]): string {
    if (parts.length === 0) return "";

    let result = parts[0];
    let andIndex = parts.length - 1;
    let insertFirstComma = false;

    for (let index = 1; index < andIndex; index++) {
        if (!insertFirstComma) {
            result += ", ";
            insertFirstComma = true;
        }

        result += parts[index] + ", ";
    }

    if (andIndex > 0) result += "and " + parts[andIndex];

    return result;
}

/**
 * Gets the permission level of the specified member
 * @param member The member
 * @param channel The channel
 * @param guild The guild
 */
export function getPermissionLevel(member: GuildMember | User, channel: NewsChannel | DMChannel | TextChannel, guild?: Guild): PermissionLevel {
    let dms = (
        // deprecated as there is no group channels anymore
        /* channel.type === "group" || */
        channel.type === "dm");
    let user_id = (member instanceof GuildMember ? member.user : member).id;

    // bot owner
    if (BOT_OWNERS.includes(user_id)) return "bot-owner";

    // little devil
    if (config.bot.client_id === user_id) return "little-devil";

    // if in dms, user has no permissions
    if (dms === true || guild === undefined || member instanceof User) return "none";

    // only channels left are guild channels, this we can use member.user

    // server owner
    if (user_id === guild.ownerID) return "server-owner";

    // server admin
    if (member.hasPermission("ADMINISTRATOR")) return "server-admin";

    // bot admin
    if (member.hasPermission("MANAGE_GUILD")) return "bot-admin";

    // moderator
    let guild_data = fireStore.guildData[guild.id];
    if (guild_data !== undefined && guild_data.options.mods.includes(member.id)) return "moderator";

    // none
    return "none";
}

/**
 * Does the given member have a specific permission level?
 * @param permissionLevel The permission level to check for
 * @param member the member
 * @param channel the channel
 * @param guild the guild
 */
export function hasPermission(permissionLevel: PermissionLevel, member: GuildMember | User, channel: NewsChannel | DMChannel | TextChannel, guild?: Guild): boolean {
    let member_permission_level = getPermissionLevel(member, channel, guild);

    return !(PERMISSIONS.indexOf(member_permission_level) < PERMISSIONS.indexOf(permissionLevel));
}

/**
 * Does the given member have the exact permission level?
 * @param permissionLevel The permission level to check for
 * @param member the member
 * @param channel the channel
 * @param guild the guild
 */
export function hasExactPermission(permissionLevel: PermissionLevel, member: GuildMember | User, channel: NewsChannel | DMChannel | TextChannel, guild?: Guild): boolean {
    let member_permission_level = getPermissionLevel(member, channel, guild);

    return PERMISSIONS.indexOf(member_permission_level) === PERMISSIONS.indexOf(permissionLevel);
}

export type VerifyResult = {
    /** Whether or not the command was verified successfully */
    success: true
} | {
    /** Whether or not the command was verified successfully */
    success: false,
    /** The reason why verifying the result failed */
    reason: string,
    /** The type of fail */
    type: VerifyResultFailedType
}

export type VerifyResultFailedType = "no-dms" | "no-server" | "nsfw" | "permissions";

/**
 * Verifies whether command given can be used in this given context
 * 
 * @param command The command to verify
 * @param member The member to use
 * @param channel The channel to use
 * @param guild The guild to use
 */
export function verifyCommand(command: DiscordCommand, member: GuildMember | User, channel: NewsChannel | DMChannel | TextChannel, guild?: Guild): VerifyResult {
    let dms = (
        // deprecated as there is no group channels anymore
        /* channel.type === "group" || */
        channel.type === "dm");
    
    // in dms
    if (!command.allowInDMS && dms) {
        return { 
            "success": false, 
            "reason": 
            "Command can't be used in Direct Messages", 
            "type": "no-dms" 
        };
    }

    // in servers
    if (!command.allowInServers && !dms) {
        return { 
            "success": false, 
            "reason": 
            "Command can't be used in Servers", 
            "type": "no-server"
        };
    }

    // nsfw checking
    if (command.nsfw) {
        if (dms) {
            let userData: UserData | undefined = fireStore.userData[member.id];
            if (userData === undefined) userData = fireStore.defaultUserData();

            if (!userData.allowNSFW) {
                return { 
                    "success": false, 
                    "reason": "This is NSFW (Not Safe For Work) command. To use such a command, you must enable `Allow NSFW` on your account", 
                    "type": "nsfw" 
                };
            }
        }
        else {
            if ((channel as TextChannel).nsfw !== true) {
                return { 
                    "success": false, 
                    "reason": "NSFW (Not Safe For Work) commands can only be used in NSFW Channels", 
                    "type": "nsfw"
                };
            }
        }
    }

    // if the command's permission level is none, then there's no need to check permissions
    if (command.permissionLevel === "none") {
        return { 
            "success": true 
        };
    }

    let result: boolean;

    // check permission level
    if (command.exactPermissionLevel === true) {
        result = hasExactPermission(command.permissionLevel, member, channel, guild);
    }
    else {
        result = hasPermission(command.permissionLevel, member, channel, guild);
    }

    if (result === true) {
        return { 
            "success": true
        };
    }
    else {
        return { 
            "success": false, 
            "reason": "You don't have permission to use this command!", 
            "type": "permissions" 
        };
    }
}

/**
 * Gets a list of users from the specified guild and args
 * @param guild The guild
 * @param args The space seperated list of user arguments
 * @param cap The maximum amount of users to get
 */
export function getUsersInGuild(guild: Guild, args: string[], cap: number = 50): User[] {
    let users: User[] = [];
    let currentInput = "";
    for (let index = 0, length = args.length; index < length; index++) {
        if (currentInput !== "") currentInput += " ";
        currentInput = args[index];

        let input = currentInput.replace(/<@!?|>/g, "");

        let member = guild.members.cache.find(member => member.id === input || member.displayName === currentInput);

        if (member !== undefined) {
            if (!users.includes(member.user)) {
                currentInput = "";
                users.push(member.user);

                if (users.length >= cap) break;
            }
        }
    }
    return users;
}

/**
 * Gets a list of users from the specified direct message channel and args
 * @param dmChannel The dm channel
 * @param args The space seperated list of user arguments
 * @param cap The maximum amount of users to get
 */
export function getUsersInDM(dmChannel: DMChannel, args: string[], cap: number = 50): User[] {
    let members: User[] = [dmChannel.recipient, dmChannel.client.user!];

    let users: User[] = [];
    let currentInput = "";

    for (let index = 0, length = args.length; index < length; index++) {
        if (currentInput !== "") currentInput += " ";
        currentInput += args[index];

        let input = currentInput.replace(/<@!?|>/g, "");

        let user = members.find(member => member.id === input || member.username === currentInput);

        if (user !== undefined) {
            if (!users.includes(user)) {
                currentInput = "";
                users.push(user);

                if (users.length >= cap || users.length >= members.length) break;
            }
        }
    }

    return users;
}

/**
 * Gets a list of users from the specified channel and args
 * @param channel The channel
 * @param args The space seperated list of user arguments
 * @param cap The maximum amount of users to get
 */
export function getUsersFromChannel(channel: Channel, args: string[], cap: number = 50): User[] {
    if (channel.type === "dm") return getUsersInDM(channel as DMChannel, args, cap);
    //else if (channel.type === "group") return getUsersInGroupDM(channel as GroupDMChannel, args, cap);
    else return getUsersInGuild((channel as GuildChannel).guild, args, cap);
}

/**
 * Replaces a given set of emojis defined from :name: notation to <:name:id> notation
 * @param message The message to replace emojis
 */
export function replaceEmojis(message: string): string {
    return message.replace(/:([a-zA-Z_-]+):/g, (full, emoji_name) => {
        let replacement: string | undefined = CUSTOM_EMOJIS[emoji_name];
        return (replacement === undefined) ? full : replacement;
    });
}

/**
 * Forms money
 * @param amount The amount of money
 * @param currency The currency of a guild
 * @param showName Whether to show the name
 */
export function formatMoney(amount: number, currency: GuildEconomyCurrencyOptions, showName = false): string {
    let result = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return showName === true || currency.symbol.length === 0 ? 
        result + " " + (amount.toString() === "1" ? currency.name : currency.pluralName) :
        currency.symbol + result;
}

/**
 * Formats an uppercase underscore string to camel case spaced string
 * @param string The string to format
 */
export function formatUpperUnderscoreCase(string: string): string {
    return string.toUpperCase().split("_").map(word => {
        if (word.length <= 1) return word.toUpperCase();
        else return word[0].toUpperCase() + word.slice(1).toLowerCase();
    }).join(" ");
}

export function getPermissions(member: GuildMember, serverAdminPermissions: string = "ADMINISTRATOR (ALL)", serverOwnerPermissions: string = "SERVER OWNER (ALL)"): string[] {
    let result: string[] = [];

    if (member.guild.ownerID === member.id) {
        result.push(serverOwnerPermissions);
    }
    else if (member.hasPermission("ADMINISTRATOR")) {
        result.push(serverAdminPermissions);
    }
    else {
        let permissions: PermissionString[] = Object.keys(Permissions.FLAGS).filter(flag => flag != "ADMINISTRATOR" && flag != "VIEW_CHANNEL") as PermissionString[];

        for (let index = 0, length = permissions.length; index < length; index++) {
            let permission = permissions[index];
            if (member.hasPermission(permission)) {
                result.push(formatUpperUnderscoreCase(permission));
            }
        }
    }

    return result;
}

/**
 * Returns a string describing a given permission level
 * @param permissionLevel The permission level to describe
 */
export function getPermissionLevelDescription(permissionLevel: PermissionLevel): string {
    switch (permissionLevel) {
        case "bot-admin":
            return "A user is recognized by `bot-admin` when they have the `Manage Server` permission";
        case "bot-owner":
            return "The owner of Little Devil. The bot owner is able to run any command, whilst also having access to exclusive debugging commands.";
        case "server-admin":
            return "A user is recognized by `server-admin` when they have the `Administrator` permission";
        case "little-devil":
            return "Little Devil's permission level. Only Little Devil has this permission level. This permission is above `server-owner`!";
        case "moderator":
            return "A user is recognized by `moderator` if they are in the server moderator list";
        case "server-owner":
            return "A user is recognized by `server-owner` if they own the server. They have the ability to run any command.";
        case "none":
            return "The default permission level.";
        default:
            return "Failed to fetch info about the given permission level";
    }
}