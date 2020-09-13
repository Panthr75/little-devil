import { MessageEmbed, User } from "discord.js";
import { GuildData, GuildEconomyCurrencyOptions, GuildUserData } from "../../../firebase";
import Translations from "../../../translations";
import { formatMoney, replaceEmojis, generateTimeLeft, cooldownInfoToString } from "../../command-utils";
import { DiscordMessage } from "../../discord-wrappers/DiscordMessage";
import embedColors from "../../embed-colors";
import DiscordCommand, { CooldownInfo, HelpInfo, PermissionLevel } from "../DiscordCommand";


export default class DailyCommand extends DiscordCommand {

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
            "description": "Allows you to collect a daily amount of money",
            "usages": [
                {
                    "info": "Collects your daily money",
                    "parameters": []
                }
            ],
            "examples": [
                {
                    "info": "Sends a message acknoledging you collected your daily cash",
                    "raw_message": ""
                }
            ]
        }
    }

    public get permissionLevel(): PermissionLevel {
        return "none";
    }

    /** The amount of milliseconds in one day */
    public get ONE_DAY(): number {
        return 86400000;
    }

    /** The leniency (in milliseconds) allowed before you lose a streak */
    public get STREAK_LENIENCY(): number {
        return this.ONE_DAY * 2;
    }

    public constructor() {
        super("daily");
    }

    public run(message: DiscordMessage) {
        if (!message.messagingAllowed) return;

        let firestore = message.client.fireStore;
        let data = message.guildData;

        if (data.options.economy.enabled === false) {
            message.channel.send(this.economy_not_enabled(data));
            return;
        }

        let userData = data.userdata[message.author.id];
        if (userData === undefined) {
            userData = firestore.defaultGuildUserData();
        }

        let dailyTS = userData.economy.dailyTS;
        let time = Date.now() - dailyTS;

        let bypass = dailyTS === 0;

        if (bypass || time >= this.ONE_DAY) {
            let streakLost = -1;
            if (!bypass && time >= this.STREAK_LENIENCY) {
                streakLost = userData.economy.dailyStreak;
                userData.economy.dailyStreak = 0;
            }
            else {
                userData.economy.highestDailyStreak = Math.max(userData.economy.dailyStreak, userData.economy.highestDailyStreak);
            }

            let multiplierPower = Math.min(userData.economy.dailyStreak, data.options.economy.dailyCommand.dailyMultiplierEnd);
            let multiplier = Math.pow(data.options.economy.dailyCommand.dailyMultiplier, multiplierPower);
            let moneyEarned = data.options.economy.dailyCommand.dailyAmount * multiplier;

            userData.economy.dailyStreak++;
            
            firestore.setGuildData(message.guild!.id, data, (successful) => {
                if (successful) {
                    let embed = DailyCommand.embed(streakLost, moneyEarned, data.options.economy.currency, userData, message.author);
                    message.channel.send(embed);
                }
                else {
                    message.channel.send(this.unexpected_error(data));
                }
            });
        }
        else {
            let cooldown = generateTimeLeft(this.ONE_DAY - (time - userData.economy.dailyTS));
            message.channel.send(DailyCommand.cooldown(cooldown, message.author));
        }
    }

    public needsPrefix(): boolean {
        return false;
    }

    public economy_not_enabled(data: GuildData): string {
        return replaceEmojis(":redtick: " + Translations.getWithLang(data.options.language, "economy_not_enabled"));
    }

    public unexpected_error(data: GuildData): string {
        return replaceEmojis(":redtick: " + "An unexpected error has occurred..." /* Translations.getWithLang(data.options.language, "daily_command.unexpected_error")*/);
    }

    public static cooldown(cooldown: CooldownInfo, user: User): MessageEmbed {
        return new MessageEmbed()
            .setColor(embedColors.red)
            .setTitle("__**Daily Command Cooldown**__")
            .setThumbnail(user.avatarURL()!)
            .setDescription(replaceEmojis(`:redtick: **Sorry ${user.username}, but you can't collect your money yet**`))
            .addField("**Time Remaining**", cooldownInfoToString(cooldown))
            .setTimestamp(Date.now());
    }

    public static embed(streakLost: number, moneyEarned: number, currency: GuildEconomyCurrencyOptions, userData: GuildUserData, user: User): MessageEmbed {
        if (streakLost > -1) return this.streakLostEmbed(streakLost, moneyEarned, currency, userData, user);
        else return this.collectedEmbed(moneyEarned, currency, userData, user);
    }

    public static streakLostEmbed(streakLost: number, moneyEarned: number, currency: GuildEconomyCurrencyOptions, userData: GuildUserData, user: User): MessageEmbed {
        return new MessageEmbed()
            .setColor(embedColors.actionRemove)
            .setTitle(`__**${user.username}'s Daily Money**__`)
            .setThumbnail(user.avatarURL()!)
            .setDescription(`:white_check_mark: **Collected ${formatMoney(moneyEarned, currency)}**`)
            .addField("**Streak Lost**", `You failed to keep your streak going, and lost a ${streakLost} day streak :(`)
            .addField("**Daily Info**", `**Current Streak**: ${userData.economy.dailyStreak}
**Money**: ${formatMoney(userData.economy.money, currency)}
**Highest Streak**: ${userData.economy.highestDailyStreak}`)
            .setTimestamp(Date.now());
    }

    public static collectedEmbed(moneyEarned: number, currency: GuildEconomyCurrencyOptions, userData: GuildUserData, user: User): MessageEmbed {
        return new MessageEmbed()
            .setColor(embedColors.actionRemove)
            .setTitle(`__**${user.username}'s Daily Money**__`)
            .setThumbnail(user.avatarURL()!)
            .setDescription(`:white_check_mark: **Collected ${formatMoney(moneyEarned, currency)}**`)
            .addField("**Daily Info**", `**Current Streak**: ${userData.economy.dailyStreak}
**Money**: ${formatMoney(userData.economy.money, currency)}
**Highest Streak**: ${userData.economy.highestDailyStreak}`)
            .setTimestamp(Date.now());
    }
}