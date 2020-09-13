import NekosLifeAPICommand from "./NekosLifeAPICommand";
import { PermissionLevel, HelpInfo } from "../DiscordCommand";
import { DiscordMessage } from "../../discord-wrappers/DiscordMessage";
import { MessageEmbed } from "discord.js";
import embedColors from "../../embed-colors";


export default class RandomFactCommand extends NekosLifeAPICommand {

    public get endpoint(): string {
        return "fact";
    }

    public get responseKey(): string {
        return "fact";
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
            "description": "Sends a random fact into the chat",
            "usages": [
                {
                    "info": "Sends a random fact in the chat",
                    "parameters": []
                }
            ],
            "examples": [
                {
                    "info": "Sends an embed of a random fact into the current chat",
                    "raw_message": ""
                }
            ]
        };
    }

    public constructor() {
        super("randomfact", "fact");
    }

    public needsPrefix(): boolean {
        return true;
    }

    public handleResponse(serverResponse: string, message: DiscordMessage): void {
        let embed = new MessageEmbed()
            .setColor(embedColors.devilpink)
            .setTitle("**RANDOM FACT**")
            .setDescription(serverResponse)
            .setTimestamp(Date.now())
            .setFooter("nekos.life is life");

        message.channel.send(embed);
    }
}