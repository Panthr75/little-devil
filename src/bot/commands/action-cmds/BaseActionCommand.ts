import DiscordCommand, { PermissionLevel } from "../DiscordCommand";
import { User, MessageEmbed } from "discord.js";
import { DiscordMessage } from "../../discord-wrappers/DiscordMessage";
import { getUsersFromChannel } from "../../command-utils";
import embedColors from "../../embed-colors";
import Translation from "../../../translations/Translation";
import Translations from "../../../translations";
import LittleDevilClient from "../../discord-wrappers/LittleDevilClient";

/** The action message */
export type ActionMessage = {
    /** The raw message */
    message?: string,
    /** Whether or not getting the action message was successful */
    successful: boolean
}

/** 
 * The type of action for an action message
 * * `single` - this command is being used on by the user who used the command
 * * `group` - this command is being used on a group of users
 */
export type ActionType = "single" | "group";

/**
 * The base action command for everything related to actions (like hug, smack, etc)
 */
export default abstract class BaseActionCommand extends DiscordCommand {
    
    /** The attachment channel's id */
    public abstract get attachmentChannelID(): string;

    /** The list of attachments */
    public abstract get attachments(): string[];

    public get permissionLevel(): PermissionLevel {
        return "none";
    }

    public get allowInDMS(): boolean {
        return true;
    }

    public get allowInServers(): boolean {
        return true;
    }

    public get exactPermissionLevel(): boolean {
        return false;
    }

    /**
     * Creates a new base action command
     * @param id The id of the command
     * @param aliases The aliases for this command
     */
    public constructor(id: string, ...aliases: string[]) {
        super(id, ...aliases);
    }

    public needsPrefix() {
        return true;
    }

    public run(message: DiscordMessage) {
        if (!message.messagingAllowed) return;
        let args = message.args;
        let guild_data = message.guildData;

        let translation = Translations.getLanguage(guild_data.options.language);

        let actionMessage: ActionMessage;

        if (args.length === 0) {
            actionMessage = this.getActionCommand(message.client, "single", message.author, [], translation);
        }
        else {
            let users = getUsersFromChannel(message.channel, args).filter(user => user.id !== message.author.id);
            actionMessage = this.getActionCommand(message.client, users.length === 0 ? "single" : "group", message.author, users, translation);
        }

        if (!actionMessage.successful) {
            if (actionMessage.message !== undefined) message.channel.send(actionMessage.message);
            return;
        }
        
        let randomAttachment = this.attachments[Math.floor(Math.random() * this.attachments.length)];
        if (message.deletable) message.delete();

        message.channel.send(BaseActionCommand.generateEmbed(actionMessage.message!, randomAttachment));
    }

    /**
     * Gets the action message
     * @param client The bot client
     * @param type The type of action
     * @param instantiator The user who called the command
     * @param targets The users the instantiator is targeting
     * @param translation The translation to use
     */
    public abstract getActionCommand(client: LittleDevilClient, type: ActionType, instantiator: User, targets: User[], translation: Translation): ActionMessage;


    /**
     * Generates an embed for when the base action command runs successfully
     * @param actionMessage The action message
     * @param actionGif The action gid to resolve to a url
     */
    public static generateEmbed(actionMessage: string, actionGif: string) {
        return new MessageEmbed()
            .setDescription(actionMessage)
            .setColor(embedColors.devilpink)
            .setImage(`https://cdn.discordapp.com/attachments/${actionGif}`)
            .setTimestamp(Date.now());
    }
}