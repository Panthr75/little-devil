import DiscordCommand, { HelpInfo, PermissionLevel } from "../DiscordCommand";
import { DiscordMessage } from "../../discord-wrappers/DiscordMessage";
import { MessageEmbed } from "discord.js";
import embedColors from "../../embed-colors";
import { replaceEmojis } from "../../command-utils";

enum AccountTypeTranslation {
    default = "Default",
    premium = "Little Devil Premium",
    owner = "Little Devil Owner"
};

export default class AccountCommand extends DiscordCommand {

    public get allowInDMS(): boolean {
        return true;
    }

    public get allowInServers(): boolean {
        return false;
    }

    public get exactPermissionLevel(): boolean {
        return false;
    }

    public get helpInfo(): HelpInfo {
        return {
            "description": "Sends information about your account",
            "usages": [
                {
                    "info": "Sends information about your account and options",
                    "parameters": []
                }
            ],
            "examples": [
                {
                    "info": "Sends an embed with the information of your account and options for your account",
                    "raw_message": ""
                }
            ]
        };
    }

    public get permissionLevel(): PermissionLevel {
        return "none";
    }

    public constructor() {
        super("account");
    }

    public needsPrefix() {
        return true;
    }

    public run(message: DiscordMessage) {
        if (!message.messagingAllowed) return;

        let args = message.args;

        let userData = message.client.fireStore.userData[message.author.id];
        if (userData === undefined) userData = global.fireStore.defaultUserData();

        if (args.length === 0) {
            let untranslatedAccountType = userData.userType as keyof typeof AccountTypeTranslation;
            let accountType = AccountTypeTranslation[untranslatedAccountType];
            let joinedAt = new Date(userData.joinedAt);

            let embed = new MessageEmbed()
                .setColor(embedColors.devilpink)
                .addField("Acount Type", accountType, true)
                .addField("Allow NSFW Content", replaceEmojis(`:${(userData.allowNSFW ? "greentick" : "redtick")}:`), true)
                .addField("Integrated with Little Devil Date", `${(joinedAt.getMonth() + 1).toString().padStart(2, '0')}/${joinedAt.getDate().toString().padStart(2, '0')}/${joinedAt.getFullYear()}`, true)
                .setTimestamp(Date.now());

            message.channel.send(embed);
        }
    }
}