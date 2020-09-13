import DiscordCommand, { PermissionLevel, HelpInfo } from "../DiscordCommand";
import { MessageEmbed, Util } from "discord.js";
import { DiscordMessage } from "../../discord-wrappers/DiscordMessage";
import embedColors from "../../embed-colors";
import { replaceEmojis, hasPermission } from "../../command-utils";

let fireStore = global.fireStore;

export default class PrefixCommand extends DiscordCommand {
    
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
            "description": "Gets the prefix of the server (doesn't require using the prefix). To set one, moderator permission is required.",
            "usages": [
                {
                    "info": "Sends a message with the current prefix",
                    "parameters": []
                },
                {
                    "info": "**Requires `moderator`** - Sets the prefix to what is defined in `new-prefix`",
                    "parameters": [
                        {
                            "name": "new-prefix",
                            "optional": false,
                            "isList": false,
                            "info": "The new prefix to set the prefix to"
                        }
                    ]
                }
            ],
            "examples": [
                {
                    "info": "Sets the prefix to `+`",
                    "raw_message": "+"
                },
                {
                    "info": "Gets the current prefix",
                    "raw_message": ""
                },
                {
                    "info": "Gets the current prefix [Notice no prefix was required]",
                    "raw_message_full": true,
                    "raw_message": this.id
                }
            ]
        };
    }

    /** The maximum length a prefix can be */
    public get maxPrefixLength(): number {
        return 25;
    }

    public constructor() {
        super("prefix");
    }

    public needsPrefix(message: DiscordMessage): boolean {
        return message.args.length > 0;
    }

    public run(message: DiscordMessage): void {
        if (!message.messagingAllowed) return;

        let args = message.args;
        let guild_data = message.guildData;

        if (args.length === 0) {
            message.channel.send(PrefixCommand.generateEmbed(guild_data.options.prefix));
        }
        else {
            if (message.channel.type === "dm" /**|| message.channel.type === "group" */) {
                message.channel.send(replaceEmojis(":redtick: Setting a custom prefix in dms is not allowed!"));
            }
            else {
                if (hasPermission("moderator", message.member!, message.channel, message.guild!)) {
                    let newPrefix = args.join(" ").trim();

                    if (newPrefix.length === 0) {
                        message.channel.send(replaceEmojis(":redtick: A prefix containing only whitespaces is not allowed. (Leading and trailing whitespaces get removed on your message by Discord)"));
                    }
                    else if (newPrefix.length > this.maxPrefixLength) {
                        message.channel.send(replaceEmojis(`:redtick: The max prefix length is ${this.maxPrefixLength} characters!`));
                    }
                    else {
                        guild_data.options.prefix = newPrefix;
                        fireStore.setGuildData(message.guild!.id, guild_data, (successful) => {
                            if (successful) {
                                message.channel.send(replaceEmojis(":greentick: The server prefix has been updated"), PrefixCommand.generateEmbed(newPrefix));
                            }
                        });
                    }
                }
                else {
                    message.channel.send(replaceEmojis(":redtick: Moderator Permission is required to change the server prefix"));
                }
            }
        }
    }

    /**
     * Generates the embed for the prefix command
     * @param prefix The prefix
     */
    public static generateEmbed(prefix: string) {
        return new MessageEmbed()
            .setColor(embedColors.devilpink)
            .setTitle("**Server Prefix**")
            .setDescription(Util.escapeMarkdown(prefix))
            .setFooter("The server prefix must be added to the beginning of every command")
            .setTimestamp(Date.now());
    }
}