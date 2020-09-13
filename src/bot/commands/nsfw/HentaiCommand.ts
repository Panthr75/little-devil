import NekosLifeAPICommand from "../fun/NekosLifeAPICommand";
import { PermissionLevel, HelpInfo } from "../DiscordCommand";
import { DiscordMessage } from "../../discord-wrappers/DiscordMessage";
import { MessageEmbed } from "discord.js";
import embedColors from "../../embed-colors";


export default class HentaiCommand extends NekosLifeAPICommand {
    
    /**
     * @override
     */
    public get nsfw(): boolean {
        return true;
    }

    public get endpoint(): string {
        return "img/hentai";
    }

    public get responseKey(): string {
        return "url";
    }

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
            "description": "**[NSFW]** Sends hentai in the chat",
            "usages": [
                {
                    "info": "Sends hentai in the chat",
                    "parameters": []
                }
            ],
            "examples": [
                {
                    "info": "Sends an embed of some hentai into the current chat",
                    "raw_message": ""
                }
            ]
        };
    }

    public constructor() {
        super("hentai");
    }

    public needsPrefix(): boolean {
        return true;
    }

    public handleResponse(serverResponse: string, message: DiscordMessage): void {
        let embed = new MessageEmbed()
            .setColor(embedColors.devilpink)
            .setImage(serverResponse)
            .setTimestamp(Date.now())
            .setFooter("nekos.life is life");

        message.channel.send(embed);
    }
}