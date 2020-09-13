import DiscordCommand, { PermissionLevel, HelpInfo } from "../DiscordCommand";
import { GuildMember, Guild, MessageEmbed } from "discord.js";
import { DiscordMessage } from "../../discord-wrappers/DiscordMessage";
import { replaceEmojis } from "../../command-utils";
import embedColors from "../../embed-colors";
import Translations from "../../../translations";
import BanCommandTranslations from "../../../translations/commands/BanCommandTranslations";

export default class BanCommand extends DiscordCommand {

    public get permissionLevel(): PermissionLevel {
        return "moderator";
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
            "description": "Bans the given member",
            "usages": [
                {
                    "info": "Bans `user` from the server for `No Reason Provided`",
                    "parameters": [
                        {
                            "info": "The user id/mention to ban",
                            "name": "user",
                            "isList": false,
                            "optional": false
                        }
                    ]
                },
                {
                    "info": "Bans `user` from the server for `reason`",
                    "parameters": [
                        {
                            "info": "The user id/mention to ban",
                            "isList": false,
                            "name": "user",
                            "optional": false
                        },
                        {
                            "info": "The reason for banning the user",
                            "isList": true,
                            "name": "reason",
                            "optional": false
                        }
                    ]
                }
            ],
            "examples": [
                {
                    "info": "Bans `BadBoie` from the server",
                    "raw_message": "@BadBoie"
                },
                {
                    "info": "Bans the user with id `6969420360` for the reason `Oh baby a triple`",
                    "raw_message": "6969420360 Oh baby a triple"
                }
            ]
        };
    }

    public constructor() {
        super("ban");
    }

    public needsPrefix(): boolean {
        return true;
    }

    public run(message: DiscordMessage): void {
        if (!message.messagingAllowed) return;

        let guild_data = message.guildData;
        let args = message.args;

        let translation = Translations.getLanguage(guild_data.options.language).banCommand();

        let member: GuildMember | undefined | null = undefined;
        let first = message.mentions.users.first();
        if (first === undefined) member = message.guild!.members.cache.get(args[0]);
        else member = message.guild!.member(first);

        if (!member) {
            message.channel.send(BanCommand.cantFindUserEmbed(translation));
            return;
        }

        let banReason = args.filter((val, index) => index > 0).join(" ").trim();
        if (banReason.length === 0) banReason = "No Reason Provided";

        if (member.hasPermission("ADMINISTRATOR") || !member.bannable) {
            message.channel.send(BanCommand.cantBanUserEmbed(member.user.username, translation));
            return;
        }
        
        member.send(translation.banMessage(message.guild!.name, banReason))
            .then(() => {
                this.ban(message, message.guild!, member!, banReason, translation);
            })
            .catch(() => {
                this.ban(message, message.guild!, member!, banReason, translation);
            });
    }

    public ban(message: DiscordMessage, guild: Guild, member: GuildMember, reason: string, translation: BanCommandTranslations) {
        guild.members.ban(member, { reason: reason }).then(() => {
            if (message.deletable) message.delete();
            message.channel.send(BanCommand.bannedUserEmbed(member.user.username, member.user.avatarURL()!, reason, translation)).then(msg => {
                msg.delete({ timeout: 5000 }).catch(() => {});
            });
        }).catch(() => {
            message.channel.send(replaceEmojis(`:redtick: ${translation.failedBan(member.user.tag)}`));
        });
    }

    public static cantFindUserEmbed(translation: BanCommandTranslations): MessageEmbed {
        return new MessageEmbed()
            .setColor(embedColors.error)
            .setTitle(`__**${translation.banError()}**__`)
            .setDescription(translation.cantFindUser())
            .setTimestamp(Date.now());
    }

    public static cantBanUserEmbed(username: string, translation: BanCommandTranslations): MessageEmbed {
        return new MessageEmbed()
            .setColor(embedColors.error)
            .setTitle(`__**${translation.banError()}**__`)
            .setDescription(translation.cantBanUser(username))
            .setTimestamp(Date.now());
    }

    public static bannedUserEmbed(username: string, avatarURL: string, reason: string, translation: BanCommandTranslations) {
        return new MessageEmbed()
            .setColor(embedColors.lightgreen)
            .setTitle(`__**${translation.memberBanned()}**__`)
            .setThumbnail(avatarURL)
            .setDescription(translation.memberBannedInfo(username, reason))
            .setTimestamp(Date.now());
    }
}