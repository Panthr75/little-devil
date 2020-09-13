import DiscordCommand, { PermissionLevel, HelpInfo } from "../DiscordCommand";
import { User, MessageEmbed } from "discord.js";
import { DiscordMessage } from "../../discord-wrappers/DiscordMessage";
import { GuildEconomyCurrencyOptions } from "../../../firebase";
import { replaceEmojis } from "../../command-utils";
import embedColors from "../../embed-colors";
import Translations from "../../../translations";
import BalanceCommandTranslations from "../../../translations/commands/BalanceCommandTranslations";


export default class BalanceCommand extends DiscordCommand {

    public get permissionLevel(): PermissionLevel {
        return "none";
    }

    public get allowInDMS(): boolean {
        return false;
    }

    public get allowInServers(): boolean {
        return true;
    }

    public get exactPermissionLevel(): boolean {
        return false;
    }

    public get helpInfo(): HelpInfo {
        return {
            "description": "Displays the balance of a user.",
            "usages": [
                {
                    "info": "Displays the balance of the user who used the command",
                    "parameters": []
                },
                {
                    "info": "Gets the balance of `user`",
                    "parameters": [
                        {
                            "isList": false,
                            "name": "user",
                            "optional": false,
                            "info": "The user name, user id, or user mention to get the balance of"
                        }
                    ]
                }
            ],
            "examples": [
                {
                    "info": "Displays the balance of the person who used the command",
                    "raw_message": ""
                },
                {
                    "raw_message": "42069123456",
                    "info": "Displays the balance of the user with the id"
                },
                {
                    "raw_message": "Bobby",
                    "info": "Displays the balance of the user with the name Bobby"
                },
                {
                    "raw_message": "@Don't Mention Me Please",
                    "info": "Displays the user balance of the user `Don't Mention Me Please` [why did you mention them tho?]"
                }
            ]
        }
    }

    public constructor() {
        super("balance", "bal");
    }

    public needsPrefix(message: DiscordMessage): boolean {
        return true;
    }

    public run(message: DiscordMessage): void {
        if (message.guild === null || !message.messagingAllowed) return;

        let guild_data = message.guildData;
        let args = message.args;
        let fireStore = message.client.fireStore;

        let generalTranslation = Translations.getLanguage(guild_data.options.language);
        let translation = generalTranslation.balanceCommand();

        // check to make sure economy is enabled on the server
        if (guild_data.options.economy.enabled == false) {
            message.channel.send(replaceEmojis(":redtick: " + generalTranslation.economyNotEnabled()));
            return;
        }

        let memberKey = args.join(" ").trim();

        let member = (args.length == 0) ? message.member : message.guild.members.cache.get(memberKey.replace(/^<@!?|>$/g, ""));

        if (member == undefined) {
            member = message.guild.members.cache.find((mem) => mem.displayName == memberKey);
            if (member == undefined) {
                message.channel.send(replaceEmojis(":redtick: " + translation.userNotFound()));
                return;
            }
        }

        let user_data = guild_data.userdata[member.id];

        // if there's no user data, use the default user data, set the guild data for the user, and update the database
        if (user_data == undefined) {
            user_data = fireStore.defaultGuildUserData();
            guild_data.userdata[member.id] = user_data;

            // set the guild data
            fireStore.setGuildData(message.guild.id, guild_data);
        }

        let balanceEmbed = BalanceCommand.generateEmbed(member.user, user_data.economy.money, guild_data.options.economy.currency, translation);

        message.channel.send(balanceEmbed);
    }

    public static generateEmbed(user: User, amount: number, currency: GuildEconomyCurrencyOptions, translation: BalanceCommandTranslations): MessageEmbed {
        return new MessageEmbed()
            .setColor(embedColors.lightgreen)
            .setTitle(`__**${translation.userBalance(user)}**__`)
            .setThumbnail(user.avatarURL()!)
            .setDescription(translation.totalMoney(amount, currency))
            .setTimestamp(Date.now());
    }
}