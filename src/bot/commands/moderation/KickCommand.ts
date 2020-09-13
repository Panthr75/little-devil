import DiscordCommand, { HelpInfo, PermissionLevel } from "../DiscordCommand";
import { DiscordMessage } from "../../discord-wrappers/DiscordMessage";
import { GuildMember, MessageEmbed } from "discord.js";
import { replaceEmojis } from "../../command-utils";
import embedColors from "../../embed-colors";


export default class KickCommand extends DiscordCommand {
    
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
            "description": "Kicks a given member from the server",
            "usages": [
                {
                    "info": "Kicks `user` from the server for `No Reason Provided`",
                    "parameters": [
                        {
                            "info": "The user id/mention to kick",
                            "name": "user",
                            "isList": false,
                            "optional": false
                        }
                    ]
                },
                {
                    "info": "Kick `user` from the server for `reason`",
                    "parameters": [
                        {
                            "info": "The user id/mention to kick",
                            "isList": false,
                            "name": "user",
                            "optional": false
                        },
                        {
                            "info": "The reason for kicking the `user`",
                            "isList": true,
                            "name": "reason",
                            "optional": false
                        }
                    ]
                }
            ],
            "examples": [
                {
                    "info": "Kicks `BadBoie` from the server",
                    "raw_message": "@BadBoie"
                },
                {
                    "info": "Kick the user with id `6969420360` for the reason `Oh baby a triple`",
                    "raw_message": "6969420360 Oh baby a triple"
                }
            ]
        }
    }

    public get permissionLevel(): PermissionLevel {
        return "moderator";
    }

    public constructor() {
        super("kick");
    }

    public needsPrefix() {
        return true;
    }

    public run(message: DiscordMessage) {
        if (!message.messagingAllowed) return;

        let args = message.args;
        let guild_data = message.guildData;

        let language: string = guild_data.options.language;

        let member: GuildMember | undefined | null = undefined;
        let first = message.mentions.users.first();

        if (first === undefined) member = message.guild!.members.cache.get(args[0]);
        else member = message.guild!.member(first);

        if (!member) {
            let embed = KickCommand.cantFindUserEmbed(language);
            message.channel.send(embed);
            return;
        }
        
        let kickReason = args.filter((val, index) => index > 0).join(" ").trim();

        if (member.hasPermission("ADMINISTRATOR") || !member.kickable) {
            let embed = KickCommand.cantKickUserEmbed(member.user.username, language);
            message.channel.send(embed);
            return;
        }

        let kickMessage = this.translate(language, "kick_command.kick_message", message.guild!.name, kickReason);

        member.send(kickMessage)
            .then(() => {
                this.kick(message, member!, kickMessage, language)
            })
            .catch(() => {
                this.kick(message, member!, kickMessage, language)
            });
    }

    public kick(message: DiscordMessage, member: GuildMember, reason: string, language: string) {
        member.kick("reason").then(() => {
            if (message.deletable) message.delete();
            
            let embed = KickCommand.kickedUserEmbed(member.user.username, member.user.avatarURL()!, reason, language);

            message.channel.send(embed).then((msg) => {
                msg.delete({ timeout: 5000 }).catch(() => {});
            });
        }).catch(() => {
            let kickFailed = this.translate(language, "kick_command.failed_kick", member.user.tag);

            message.channel.send(replaceEmojis(`:redtick: ${kickFailed}`));
        });
    }

    public static cantFindUserEmbed(language: string): MessageEmbed {
        return new MessageEmbed()
            .setColor(embedColors.error)
            .setTitle(`__**${this.translate(language, "kick_command.kick_error")}**__`)
            .setDescription(this.translate(language, "kick_command.cant_find_user"))
            .setTimestamp(Date.now());
    }

    public static cantKickUserEmbed(username: string, language: string) {
        let embedTitle = this.translate(language, "kick_command.kick_error"),
            embedDescription = this.translate(language, "kick_command.cant_kick_user", username);

        return new MessageEmbed()
            .setColor(embedColors.error)
            .setTitle(`__**${embedTitle}**__`)
            .setDescription(embedDescription)
            .setTimestamp(Date.now());
    }

    public static kickedUserEmbed(username: string, avatarURL: string, reason: string, language: string) {
        let embedTitle = this.translate(language, "kick_command.member_kicked"),
            embedDescription = this.translate(language, "kick_command.member_kick_info", username, reason);
        
        return new MessageEmbed()
            .setColor(embedColors.lightgreen)
            .setTitle(`__**${embedTitle}**__`)
            .setThumbnail(avatarURL)
            .setDescription(embedDescription)
            .setTimestamp(Date.now());
    }
}