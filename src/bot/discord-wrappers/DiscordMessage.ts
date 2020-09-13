import { Message, MessageActivity, Collection, Snowflake, MessageAttachment, User, TextChannel, DMChannel, Client, NewsChannel, MessageEmbed, MessageFlags, Guild, GuildMember, MessageMentions, MessageType, MessageReference, ClientApplication, MessageReaction, CollectorFilter, AwaitMessagesOptions, ReactionCollectorOptions, ReactionCollector, StringResolvable, APIMessage, MessageEditOptions, Webhook, EmojiIdentifierResolvable, MessageOptions, MessageAdditions, SplitOptions } from "discord.js";
import { GuildData } from "../../firebase";
import LittleDevilClient from "./LittleDevilClient";

/** Represents a message on Discord. */
export class DiscordMessage {
    private readonly _message: Message;
    private readonly _client: LittleDevilClient;
    private readonly _command: string;
    private readonly _arguments: string[];
    private readonly _guildData: GuildData;

    /** Group activity */
    public get activity(): MessageActivity | null {
        return this._message.activity;
    }

    /** The arguments for this message */
    public get args(): string[] {
        return this._arguments;
    }

    /** Supplemental application information for group activities */
    public get application(): ClientApplication | null {
        return this._message.application;
    }

    /** A collection of attachments in the message - e.g. Pictures - mapped by their ID */
    public get attachments(): Collection<Snowflake, MessageAttachment> {
        return this._message.attachments;
    }

    /** The author of the message */
    public get author(): User {
        return this._message.author;
    }

    /** The channel that the message was sent in */
    public get channel(): TextChannel | DMChannel | NewsChannel {
        return this._message.channel;
    }

    /** The message contents with all mentions replaced by the equivalent text. If mentions cannot be resolved to a name, the relevant mention in the message content will not be converted. */
    public get cleanContent(): string {
        return this._message.cleanContent;
    }

    /** The client that instantiated this */
    public get client(): LittleDevilClient {
        return this._client;
    }

    /** The content of the message */
    public get content(): string {
        return this._message.content;
    }

    /** The command used */
    public get cmd(): string {
        return this._command;
    }

    /** The time the message was sent at */
    public get createdAt(): Date {
        return this._message.createdAt;
    }

    /** The timestamp the message was sent at */
    public get createdTimestamp(): number {
        return this._message.createdTimestamp;
    }

    /** Whether the message is deletable by the client user */
    public get deletable(): boolean {
        return this._message.deletable;
    }

    /** Whether this message has been deleted */
    public get deleted(): boolean {
        return this._message.deleted;
    }

    /** Whether the message is editable by the client user */
    public get editable(): boolean {
        return this._message.editable;
    }

    /** The time the message was last edited at (if applicable) */
    public get editedAt(): Date | null {
        return this._message.editedAt;
    }

    /** The timestamp the message was last edited at (if applicable) */
    public get editedTimestamp(): number | null {
        return this._message.editedTimestamp;
    }

    /** An array of cached versions of the message, including the current version Sorted from latest (first) to oldest (last) */
    public get edits(): DiscordMessage[] {
        return this._message.edits.map((msg) => DiscordMessage.from(msg, this.client));
    }

    /** A list of embeds in the message - e.g. YouTube Player */
    public get embeds(): MessageEmbed[] {
        return this._message.embeds.slice();
    }

    /** Flags that are applied to the message */
    public get flags(): Readonly<MessageFlags> {
        return this._message.flags;
    }

    /** The guild the message was sent in (if in a guild channel) */
    public get guild(): Guild | null {
        return this._message.guild;
    }

    /** The guild data */
    public get guildData(): GuildData {
        return this._guildData;
    }

    /** The ID of the message */
    public get id(): Snowflake {
        return this._message.id;
    }

    /** Represents the author of the message as a guild member. Only available if the message comes from a guild where the author is still a member */
    public get member(): GuildMember | null {
        return this._message.member;
    }

    /** All valid mentions that the message contains */
    public get mentions(): MessageMentions {
        return this._message.mentions;
    }

    /** Gets whether or not messages can be sent for the channel this message is in */
    public get messagingAllowed(): boolean {
        if (this.channel.type === "dm") return true;
        else if (this.channel.permissionsFor(this.client.user!)!.has("SEND_MESSAGES")) return true;
        else return false;
    }

    /** 
     * A random number or string used for checking message delivery
     * 
     * **This is only received after the message was sent successfully, and lost if re-fetched**
     */
    public get nonce(): string | null {
        return this._message.nonce;
    }

    /** Whether or not this message is a partial */
    public get partial(): boolean {
        return this._message.partial;
    }

    /** Whether the message is pinnable by the client user */
    public get pinnable(): boolean {
        return this._message.pinnable;
    }

    /** Whether or not this message is pinned */
    public get pinned(): boolean {
        return this._message.pinned;
    }

    /** A manager of the reactions belonging to this message */
    public get reactions(): typeof Message.prototype.reactions {
        return this._message.reactions;
    }

    /** Message reference data */
    public get reference(): MessageReference | null {
        return this._message.reference;
    }

    /** Whether or not this message was sent by Discord, not actually a user (e.g. pin notifications) */
    public get system(): boolean {
        return this._message.system;
    }

    /** Whether or not the message was Text-To-Speech */
    public get tts(): boolean {
        return this._message.tts;
    }

    /** The type of the message */
    public get type(): MessageType {
        return this._message.type;
    }

    /** The url to jump to this message */
    public get url(): string {
        return this._message.url;
    }

    /** ID of the webhook that sent the message, if applicable */
    public get webhookID(): Snowflake | null {
        return this._message.webhookID;
    }



    /**
     * Constructs a new Discord Message from an existing message and client
     * @param message The original message
     * @param client The client
     * @param cmd The command used
     * @param args The arguments for said command
     * @param guild_data The guild data
     */
    public constructor(message: Message, client: LittleDevilClient, cmd: string, args: string[], guild_data: GuildData) {
        this._message = message;
        this._client = client;
        this._command = cmd;
        this._arguments = args;
        this._guildData = guild_data;
    }


    public static from(message: Message, client: LittleDevilClient) {
        let fireStore = client.fireStore;

        let args = message.content.split(' ');
        let cmd = args.splice(0, 1)[0];
        
        let guild_data: GuildData = message.guild === null ? fireStore.defaultGuildData() : fireStore.guildData[message.guild.id];
        if (guild_data == undefined) guild_data = fireStore.defaultGuildData();

        return new DiscordMessage(message, client, cmd, args, guild_data);
    }



    /** 
     * Similar to createReactionCollector but in promise form. Resolves with a collection of reactions that pass the specified filter.
     * @param filter The filter function to use
     * @param options Optional options to pass to the internal collector
     * @example
     * // Create a reaction collector
     * const filter = (reaction, user) => reaction.emoji.name === '👌' && user.id === 'someID'
     * message.awaitReactions(filter, { time: 15000 })
     *   .then(collected => console.log(`Collected ${collected.size} reactions`))
     *   .catch(console.error);
     */
    public awaitReactions(filter: CollectorFilter, options: AwaitMessagesOptions = {}): Promise<Collection<string, MessageReaction>> {
        return this._message.awaitReactions(filter, options);
    }

    /**
     * Creates a reaction collector.
     * @param filter The filter to apply
     * @param options Options to send to the collector
     * @example
     * // Create a reaction collector
     * const filter = (reaction, user) => reaction.emoji.name === '👌' && user.id === 'someID';
     * const collector = message.createReactionCollector(filter, { time: 15000 });
     * collector.on('collect', r => console.log(`Collected ${r.emoji.name}`));
     * collector.on('end', collected => console.log(`Collected ${collected.size} items`));
     */
    public createReactionCollector(filter: CollectorFilter, options: ReactionCollectorOptions = {}): ReactionCollector {
        return this._message.createReactionCollector(filter, options);
    }

    /**
     * Deletes the message.
     * @param options Options
     */
    public delete(options?: {
        /** How long to wait to delete the message in milliseconds */
        timeout: number,
        /** Reason for deleting this message, if it does not belong to the client user */
        reason: string
}): Promise<DiscordMessage> {
        return (options === undefined ? 
            this._message.delete() :
            this._message.delete(options)).then((msg) => DiscordMessage.from(msg, this.client));
    }

    /**
     * Edits the content of the message.
     * @param content The new content for the message
     * @param options The options to provide
     * @example
     * // Update the content of a message
     * message.edit('This is my new content!')
     *   .then(msg => console.log(`Updated the content of a message to ${msg.content}`))
     *   .catch(console.error);
     */
    public edit(content: StringResolvable, options?: MessageEditOptions | MessageEmbed): Promise<DiscordMessage>;

    /**
     * Edits the content of the message.
     * @param options The options to provide
     * @example
     * // Update the content of a message
     * message.edit('This is my new content!')
     *   .then(msg => console.log(`Updated the content of a message to ${msg.content}`))
     *   .catch(console.error);
     */
    public edit(options: MessageEditOptions | MessageEmbed | APIMessage): Promise<DiscordMessage>;
    
    public edit(content: StringResolvable | MessageEditOptions | MessageEmbed | APIMessage, options?: MessageEditOptions | MessageEmbed): Promise<DiscordMessage> {
        return this._message.edit(content, options).then(msg => DiscordMessage.from(msg, this.client));
    }

    /**
     * Used mainly internally. Whether two messages are identical in properties. If you want to compare messages without checking all the properties, use `message.id === message2.id`, which is much more efficient. This method allows you to see if there are differences in content, embeds, attachments, nonce and tts properties.
     * @param message The message to compare to
     * @param rawData Raw data passed through the WebSocket about this message
     */
    public equals(message: Message, rawData: object): boolean {
        return this._message.equals(message, rawData);
    }

    /** Fetch this message. */
    public fetch(): Promise<DiscordMessage> {
        return this._message.fetch().then(msg => DiscordMessage.from(msg, this.client));
    }

    /** Fetches the webhook used to create this message. */
    public fetchWebhook(): Promise<Webhook> {
        return this._message.fetchWebhook();
    }

    /** Pins this message to the channel's pinned messages. */
    public pin(): Promise<DiscordMessage> {
        return this._message.pin().then(msg => DiscordMessage.from(msg, this.client));
    }

    /** 
     * Adds a reaction to the message.
     * @param emoji The emoji to react with
     */
    public react(emoji: EmojiIdentifierResolvable): Promise<MessageReaction> {
        return this._message.react(emoji);
    }

    
    /**
     * Replies to the message.
     * @param content The content for the message
     * @param options The options to provide
     * @example
     * // Reply to a message
     * message.reply('Hey, I\'m a reply!')
     *   .then(() => console.log(`Sent a reply to ${message.author.username}`))
     *   .catch(console.error);
     */
    public reply(
        content?: StringResolvable,
        options?: MessageOptions | MessageAdditions | (MessageOptions & { split?: false }) | MessageAdditions,
    ): Promise<DiscordMessage>;
    /**
     * Replies to the message.
     * @param content The content for the message
     * @param options The options to provide
     * @example
     * // Reply to a message
     * message.reply('Hey, I\'m a reply!')
     *   .then(() => console.log(`Sent a reply to ${message.author.username}`))
     *   .catch(console.error);
     */
    public reply(
        content?: StringResolvable,
        options?: (MessageOptions & { split: true | SplitOptions }) | MessageAdditions,
    ): Promise<DiscordMessage[]>;
    /**
     * Replies to the message.
     * @param options The options to provide
     * @example
     * // Reply to a message
     * message.reply('Hey, I\'m a reply!')
     *   .then(() => console.log(`Sent a reply to ${message.author.username}`))
     *   .catch(console.error);
     */
    public reply(
        options?:
          | MessageOptions
          | MessageAdditions
          | APIMessage
          | (MessageOptions & { split?: false })
          | MessageAdditions
          | APIMessage,
    ): Promise<DiscordMessage>;
    /**
     * Replies to the message.
     * @param options The options to provide
     * @example
     * // Reply to a message
     * message.reply('Hey, I\'m a reply!')
     *   .then(() => console.log(`Sent a reply to ${message.author.username}`))
     *   .catch(console.error);
     */
    public reply(
        options?: (MessageOptions & { split: true | SplitOptions }) | MessageAdditions | APIMessage,
    ): Promise<DiscordMessage[]>;

    public reply(content: StringResolvable | APIMessage | MessageOptions, options?: MessageOptions | MessageAdditions | SplitOptions) {
        // @ts-ignore
        return this._message.reply(content, options).then((arg) => {
            if (Array.isArray(arg)) return arg.map((msg) => DiscordMessage.from(msg, this.client));
            return DiscordMessage.from(arg, this.client);
        });
    }

    /**
     * Suppresses or unsuppresses embeds on a message
     * @param suppress If the embeds should be suppressed or not
     */
    public suppressEmbeds(suppress: true): Promise<DiscordMessage> {
        return this._message.suppressEmbeds(suppress).then(msg => DiscordMessage.from(msg, this.client));
    }

    /** When concatenated with a string, this automatically concatenates the message's content instead of the object. */
    public toString(): string {
        return this._message.toString();
    }

    /** Unpins this message from the channel's pinned messages. */
    public unpin(): Promise<DiscordMessage> {
        return this._message.unpin().then(msg => DiscordMessage.from(msg, this.client));
    }

    /**
     * Returns whether or not messaging is allowed without having to
     * create a new instance of `DiscordMessage`
     * @param message The message
     */
    public static messagingAllowed(message: Message): boolean;

    /**
     * Returns whether or not messaging is allowed without having to
     * create a new instance of `DiscordMessage`
     * @param message The message
     */
    public static messagingAllowed(message: DiscordMessage): boolean;
    
    public static messagingAllowed(message: DiscordMessage | Message): boolean {
        if (message instanceof DiscordMessage) {
            return message.messagingAllowed;
        }
        else {
            if (message.channel.type === "dm") return true;
            else if (message.channel.permissionsFor(message.client.user!)!.has("SEND_MESSAGES")) return true;
            else return false;
        }
    }
}