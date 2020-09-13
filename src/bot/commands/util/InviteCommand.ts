import DiscordCommand, { PermissionLevel, HelpInfo } from "../DiscordCommand";
import { MessageEmbed } from "discord.js";
import { DiscordMessage } from "../../discord-wrappers/DiscordMessage";
import embedColors from "../../embed-colors";
import Translations from "../../../translations";

export default class InviteCommand extends DiscordCommand {
    
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

    public get helpInfo(): HelpInfo {
        return {
            "description": "Sends an embed with a link to invite the bots to other guilds",
            "usages": [
                {
                    "info": "Dm's the author an embed with a link to invite the bot",
                    "parameters": []
                }
            ],
            "examples": [
                {
                    "info": "Do I have to list this a third time? It dm's the person who used the command an embed with the link for the invite",
                    "raw_message": ""
                }
            ]
        };
    }

    public constructor() {
        super("invite");
    }

    public needsPrefix() {
        return true;
    }

    public run(message: DiscordMessage) {
        if (!message.messagingAllowed) return;
        let translator = Translations.getLanguage(message.guildData.options.language).inviteCommand();
        message.author.send(new MessageEmbed()
            .setColor(embedColors.gold)
            .setDescription(translator.getInvite(`https://discord.com/oauth2/authorize?client_id=${message.client.config.client_id}&permissions=8&scope=bot`)));
    }
}