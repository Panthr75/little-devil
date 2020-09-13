import { Client, Guild, Message, ChannelManager, GuildEmojiManager, GuildManager, ClientOptions, ShardClientUtil, ClientUser, UserManager, ClientVoiceManager, WebSocketManager, Snowflake, ClientApplication, GuildResolvable, InviteResolvable, Invite, Collection, VoiceRegion, Webhook, GuildPreview, PermissionResolvable, MessageEmbed, TextChannel, PartialMessage } from "discord.js";
import Firestore, { GuildData } from "../../firebase";
import { DiscordMessage } from "./DiscordMessage";
import DiscordCommand from "../commands/DiscordCommand";
import { verifyCommand, replaceEmojis } from "../command-utils";
import Logger from "../../logger";
import cfg, { BotConfig } from "../../config";


const BOT_PREFIX = new RegExp(`^<@!?${cfg.bot.client_id}> ?`);

/**
 * The client class for Little Devil
 */
export default class LittleDevilClient {

    /** The raw Discord Client */
    public readonly client: Client;

    /** The raw firestore for this client */
    public readonly fireStore: Firestore;

    /** The logger for the bot */
    public readonly logger: Logger;

    /** The config of the bot */
    public readonly config: BotConfig;

    /** The commands for this client */
    public commands: DiscordCommand[];

    //#region Discord.JS wrapper arguments

    /**
     * All of the Channels that the client is currently handling, mapped by their IDs - as long as sharding isn't being used, this will be 
     * *every* channel in *every* guild the bot is a member of. Note that DM channels will not be initially cached, and thus not be present 
     * in the Manager without their explicit fetching or use.
     */
    public get channels(): ChannelManager {
        return this.client.channels;
    }

    /**
     * All custom emojis that the client has access to, mapped by their IDs
     */
    public get emojis(): GuildEmojiManager {
        return this.client.emojis;
    }

    /**
     * All of the guilds the client is currently handling, mapped by their IDs - as long as sharding isn't being used, this will be every guild the bot is a member of
     */
    public get guilds(): GuildManager {
        return this.client.guilds;
    }

    /**
     * The options the client was instantiated with
     */
    public get options(): ClientOptions {
        return this.client.options;
    }

    public set options(newOptions: ClientOptions) {
        this.client.options = newOptions;
    }

    /**
     * Time at which the client was last regarded as being in the `READY` state 
     * (each time the client disconnects and successfully reconnects, this will be overwritten)
     */
    public get readyAt(): Date | null {
        return this.client.readyAt;
    }

    /**
     * Timestamp of the time the client was last `READY` at
     */
    public get readyTimestamp(): number | null {
        return this.client.readyTimestamp;
    }

    /** Shard helpers for the client (only if the process was spawned from a ShardingManager) */
    public get shard(): ShardClientUtil | null {
        return this.client.shard;
    }

    /** 
     * Authorization token for the logged in bot. If not set, will return the config's token
     */
    public get token(): string {
        return this.client.token || this.config.token;
    }

    /** How long it has been since the client last entered the `READY` state in milliseconds */
    public get uptime(): number | null {
        return this.client.uptime;
    }

    /** User that the client is logged in as */
    public get user(): ClientUser | null {
        return this.client.user;
    }

    /** All of the User objects that have been cached at any point, mapped by their IDs */
    public get users(): UserManager {
        return this.client.users;
    }

    /** The voice manager of the client (`null` in browsers) */
    public get voice(): ClientVoiceManager | null {
        return this.client.voice;
    }

    /** The WebSocket manager of the client */
    public get ws(): WebSocketManager {
        return this.client.ws;
    }

    //#endregion

    /** The ID of the client */
    public get clientID(): Snowflake {
        return this.config.client_id;
    }

    /** The version this bot is in */
    public get version(): string {
        return this.config.version;
    }

    /** The client secret for the bot */
    public get clientSecret(): string {
        return this.config.secret;
    }

    /** The start status of the bot */
    public get startStatus(): string {
        return this.config.startStatus;
    }

    /** Whether or not the bot is enabled */
    public get enabled(): boolean {
        return this.config.enabled;
    }

    /** The default prefix for the bot */
    public get defaultPrefix(): string {
        return this.fireStore.defaultGuildDataOptions().prefix;
    }

    /** Instantiates a new Little Devil Client */
    public constructor(fireStore: Firestore, config: BotConfig = cfg.bot) {
        this.client = new Client();
        this.fireStore = fireStore;
        this.config = config;
        this.commands = [];
        this.logger = new Logger("BOT", true, true);
    }

    /**
     * Inits this client, doing such things like:
     * * adding the listeners to the discord client
     * * logging in
     * * loading the commands
     */
    public init(): void {
        this.client.on("guildCreate", (guild) => this.onGuildCreate(guild));
        this.client.on("guildDelete", (guild) => this.onGuildDelete(guild));

        this.client.on("message", (message) => this.onMessage(message));
        this.client.on("messageUpdate", (oldMessage, newMessage) => this.onMessageUpdate(oldMessage, newMessage));

        this.client.on("ready", () => this.onReady());

        this.reloadCommands();

        this.login(this.config.token);
    }

    /**
     * Reloads the commands
     */
    public reloadCommands(): void {
        delete require.cache[require.resolve("../commands/index")];
        this.commands = require("../commands/index").default;
    }

    /**
     * Handles a command
     * @param msg The raw message that was sent
     * @param cmd The id of the command to handle
     * @param args The args for said command
     * @param guild_data The data for the guild
     * @param dms Whether or not we are dm context (message was sent in a DM Channel)
     * @param usedPrefix Whether or not we used the prefix
     * @returns Whether or not to continue the flow to do things like checking banned words
     */
    public handleCommand(msg: Message, cmd: string, args: string[], guild_data: GuildData, dms: boolean, usedPrefix: boolean): boolean {
        let message = new DiscordMessage(msg, this, cmd, args, guild_data);

        /** The command */
        let command: DiscordCommand | undefined = undefined;
        let commands = this.commands;

        // search for the command
        for (let index = 0, length = commands.length; index < length; index++) {
            let c = commands[index];
            if (c.equals(cmd)) {
                command = c;
                break;
            }
        }

        // make sure we found the command
        if (command === undefined) return false;

        let invalidPrefix = !usedPrefix && command.needsPrefix(message);

        // make sure we used the prefix if it's required
        if (invalidPrefix) return false;

        let verifyResult = verifyCommand(command, message.member || message.author, message.channel, message.guild || undefined);

        // the command can be used
        if (verifyResult.success) {
            // attempt to run the command, and log an error if is an error
            try {
                command.run(message);
            }
            catch(err) {
                this.logger.error(`Attempted to run "${command.id}" command, but was thrown an error: ${err}`);
                if (err.stack !== undefined) this.logger.error(err.stack.toString());
            }

            return true;
        }
        // check if the reason why verification failed was because the command
        // was marked as NSFW, and we are not in a NSFW context
        else if (verifyResult.type === "nsfw") {
            // send a message in the channel, letting the user know that nsfw is not enabled

            if (message.deletable) message.delete();
            if (message.messagingAllowed) {
                message.channel.send(replaceEmojis(":redtick: **" + verifyResult.reason + "**"));
            }

            return false;
        }

        // if they don't have permission to use this command, let them know.
        // obviously, don't let them know about bot-owner specific commands
        else if (!dms && command.permissionLevel !== "bot-owner") {
            if (message.messagingAllowed) {
                message.channel.send(replaceEmojis(":redtick: Sorry, but you don't have permission to use this command"));
            }

            return true;
        }

        // Otherwise the command was not executed properly, and thus dont stop the flow
        else return false;
    }

    /**
     * Invoked whenever the client joins a guild
     * @param guild The guild that the bot joined
     */
    public onGuildCreate(guild: Guild) {
        let guildData = this.fireStore.defaultGuildData();
        this.fireStore.guildData[guild.id] = guildData;
        this.fireStore.setGuildData(guild.id, guildData);
    }

    /**
     * Invoked whenever the client leaves a guild or is kicked
     * from it
     * @param guild The guild that the bot left
     */
    public onGuildDelete(guild: Guild) {
        if (this.fireStore.guildData[guild.id] !== undefined) {
            this.fireStore.deleteGuildData(guild.id);
        }
    }

    /**
     * Invoked whenever a message is recieved
     * @param message The message that was sent
     */
    public onMessage(message: Message) {
        // don't allow commands from bot
        if (message.author.bot) return;

        let dms = message.channel.type === "dm";

        // if not a dm, get the guild data, otherwise return undefined
        let guild_data = dms ? undefined : this.fireStore.guildData[message.guild!.id];

        // store whether or not we want to update the guild database
        let updateDB = false;

        if (guild_data === undefined) {
            guild_data = this.fireStore.defaultGuildData();
            updateDB = !dms;
        }

        // if there's no options, add it
        if (guild_data.options === undefined) {
            guild_data.options = this.fireStore.defaultGuildDataOptions();
            updateDB = !dms;
        }
        
        // if there's no userdata, add it
        if (guild_data.userdata === undefined) {
            guild_data.userdata = {};
            updateDB = !dms;
        }

        // if there's no userdata for the author, add it
        if (guild_data.userdata[message.author.id] === undefined) {
            guild_data.userdata[message.author.id] = this.fireStore.defaultGuildUserData();
            updateDB = !dms;
        }

        // update database if needed
        if (updateDB && !dms) {
            this.fireStore.setGuildData(message.guild!.id, guild_data);
        }

        // get prefix
        let prefix = guild_data.options.prefix;

        let content = message.content.replace(BOT_PREFIX, prefix);

        let hasPrefix = content.startsWith(prefix);

        if (hasPrefix) content = content.slice(prefix.length, content.length);

        let args = content.split(' ');
        let cmd = args.splice(0, 1)[0];

        if (this.handleCommand(message, cmd, args, guild_data, dms, hasPrefix)) return;

        // check if not bad word
        let contentSplit = content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[^A-Za-z]/g);
        for (let index = 0, length = guild_data.options.bannedWords.length; index < length; index++) {
            let bannedWord = guild_data.options.bannedWords[index];

            if (contentSplit.includes(bannedWord)) {
                if (message.deletable) message.delete();

                if (DiscordMessage.messagingAllowed(message)) {
                    message.channel.send(replaceEmojis(":redtick: No banned words are allowed!"))
                        .then((msg) => msg.delete({ timeout: 2000 }))
                        .catch(() => {});
                }

                break;
            }
        }
    }

    /**
     * Invoked whenever a message is updated. This is not limited to content changes, but could also include things like embeds being added.
     * @param oldMessage The old message
     * @param newMessage The new message
     */
    public onMessageUpdate(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
        if (oldMessage.content !== newMessage.content) {
            this.onMessageEdit(oldMessage, newMessage);
        }
    }

    /**
     * Invoked whenever a message is edited. This is called the `onMessageUpdate` method if the old message content and new message content are different. 
     * @param oldMessage The old message
     * @param newMessage The new message
     */
    public onMessageEdit(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
        let guild = oldMessage.guild;
        if (guild === null) return;

        let guild_data = this.fireStore.guildData[guild.id];
        let loggingOptions = guild_data.options.logging;
        if (loggingOptions.message.edit !== true) return;

        let logChannel = loggingOptions.log_channel;

        let channel = logChannel == undefined ? undefined : guild.channels.cache.get(logChannel);

        if (channel === undefined || channel.type === "voice" || channel.type === "category" || channel.type === "store") return;

        let embed = new MessageEmbed()
            .setTitle("**Message History**")
            .setDescription(`Message by ${oldMessage.member!.displayName} in <#${oldMessage.channel.id}> was edited.`)
            .addField("**Latest Message**", newMessage.content)
            .addField("**Original Message**", oldMessage.content)
            .setTimestamp(Date.now());

        if (oldMessage.author != null) {
            embed.setThumbnail(oldMessage.author.avatarURL()!);
        }

        (channel as TextChannel).send(embed);
    }

    /**
     * Invoked whenever the client is ready
     */
    public onReady() {
        this.logger.info("Bot is now ready!");
        this.user!.setPresence({
            "activity": {
                "name": `${this.defaultPrefix}help | ${this.startStatus} | ${this.version}`,
                "type": "PLAYING"
            },
            "status": "online"
        });
    }

    //#region Discord.JS wrapper methods

    /**
     * Clears an immediate.
     * @param immediate Immediate to cancel
     */
    public clearImmediate(immediate: NodeJS.Immediate): void {
        this.client.clearImmediate(immediate);
    }

    /**
     * Clears an interval.
     * @param interval Interval to cancel
     */
    public clearInterval(interval: NodeJS.Timeout): void {
        this.client.clearInterval(interval);
    }

    /**
     * Clears a timeout.
     * @param timeout Timeout to cancel
     */
    public clearTimeout(timeout: NodeJS.Timeout): void {
        this.client.clearInterval(timeout);
    }

    /**
     * Logs out, terminates the connection to Discord, and destroys the client.
     */
    public destroy(): void {
        this.client.destroy();
    }

    /**
     * Obtains the OAuth Application of this bot from Discord.
     */
    public fetchApplication(): Promise<ClientApplication> {
        return this.client.fetchApplication();
    }

    /**
     * Obtains a guild preview from Discord, only available for public guilds.
     * @param guild The guild to fetch the preview for
     */
    public fetchGuildPreview(guild: GuildResolvable): Promise<GuildPreview> {
        return this.client.fetchGuildPreview(guild);
    }

    /**
     * Obtains an invite from Discord.
     * @param invite Invite code or URL
     * @example
     * client.fetchInvite('https://discord.gg/bRCvFy9')
     *   .then(invite => console.log(`Obtained invite with code: ${invite.code}`))
     *   .catch(console.error);
     */
    public fetchInvite(invite: InviteResolvable): Promise<Invite> {
        return this.client.fetchInvite(invite);
    }

    /**
     * Obtains the available voice regions from Discord.
     * @example
     * client.fetchVoiceRegions()
     *   .then(regions => console.log(`Available regions are: ${regions.map(region => region.name).join(', ')}`))
     *   .catch(console.error);
     */
    public fetchVoiceRegions(): Promise<Collection<string, VoiceRegion>> {
        return this.client.fetchVoiceRegions();
    }

    /**
     * Obtains a webhook from Discord.
     * @param id ID of the webhook
     * @param token Token for the webhook
     * @example
     * client.fetchWebhook('id', 'token')
     *   .then(webhook => console.log(`Obtained webhook with name: ${webhook.name}`))
     *   .catch(console.error);
     */
    public fetchWebhook(id: Snowflake, token?: string): Promise<Webhook> {
        return this.client.fetchWebhook(id, token);
    }

    /**
     * Generates a link that can be used to invite the bot to a guild.
     * @param permissions Permissions to request
     * @example
     * client.generateInvite(['SEND_MESSAGES', 'MANAGE_GUILD', 'MENTION_EVERYONE'])
     *   .then(link => console.log(`Generated bot invite link: ${link}`))
     *   .catch(console.error);
     */
    public generateInvite(permissions?: PermissionResolvable) {
        return this.client.generateInvite(permissions);
    }

    /**
     * Logs the client in, establishing a websocket connection to Discord.
     * @param token Token of the account to log in with
     * @returns Token of the account used
     */
    public login(token?: string): Promise<string> {
        return this.client.login(token);
    }

    /**
     * Sets an immediate that will be automatically cancelled if the client is destroyed.
     * @param fn Function to execute
     * @param args Arguments for the function
     */
    public setImmediate(fn: (...args: any[]) => void, ...args: any[]): NodeJS.Immediate {
        return this.client.setImmediate(fn, ...args);
    }

    /**
     * Sets an interval that will be automatically cancelled if the client is destroyed.
     * @param fn Function to execute
     * @param delay Time to wait between executions (in milliseconds)
     * @param args Arguments for the function
     */
    public setInterval(fn: (...args: any[]) => void, delay: number, ...args: any[]): NodeJS.Timeout {
        return this.client.setInterval(fn, delay, ...args);
    }

    /**
     * Sets a timeout that will be automatically cancelled if the client is destroyed.
     * @param fn Function to execute
     * @param delay Time to wait before executing (in milliseconds)
     * @param args Arguments for the function
     */
    public setTimeout(fn: (...args: any[]) => void, delay: number, ...args: any[]): NodeJS.Timeout {
        return this.client.setTimeout(fn, delay, ...args);
    }

    /**
     * Sweeps all text-based channels' messages and removes the ones older than the max message lifetime. 
     * If the message has been edited, the time of the edit is used rather than the time of the original message.
     * @param lifetime Messages that are older than this (in seconds) will be removed from the caches. 
     * The default is based on `ClientOptions#messageCacheLifetime`
     * @returns Amount of messages that were removed from the caches, or -1 if the message cache lifetime is unlimited
     * @example
     * // Remove all messages older than 1800 seconds from the messages cache
     * const amount = client.sweepMessages(1800);
     * console.log(`Successfully removed ${amount} messages from the cache.`);
     */
    public sweepMessages(lifetime?: number): number {
        return this.client.sweepMessages(lifetime);
    }

    //#endregion
}