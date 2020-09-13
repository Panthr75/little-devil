import DiscordCommand, { PermissionLevel, HelpInfo, HelpInfoUsage, HelpInfoExample } from "../DiscordCommand";
import { MessageEmbed, TextChannel } from "discord.js";
import { DiscordMessage } from "../../discord-wrappers/DiscordMessage";
import { UserData } from "../../../firebase";
import embedColors from "../../embed-colors";
import Translations from "../../../translations";


export default class HelpCommand extends DiscordCommand {

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
            "description": "Gives help for the specified command, or shows the list of commands",
            "usages": [
                {
                    "info": "Sends a list of commands for the given page number",
                    "parameters": [
                        {
                            "info": "The page number",
                            "name": "page",
                            "isList": false,
                            "optional": true,
                            "defaultValue": "1"
                        }
                    ]
                },
                {
                    "info": "Sends the help info for this specific command",
                    "parameters": [
                        {
                            "info": "The command",
                            "name": "command",
                            "isList": false,
                            "optional": false
                        }
                    ]
                }
            ],
            "examples": [
                {
                    "info": "Sends the first page of commands",
                    "raw_message": "1"
                },
                {
                    "info": "Sends the help info for the prefix command",
                    "raw_message": "prefix"
                }
            ]
        }
    }

    public constructor() {
        super("help");
    }

    public needsPrefix(): boolean {
        return true;
    }

    /**
     * Gets the commands
     * @param page The page number to get the commands
     * @param inDMS Whether or not we are in dms
     * @param maxCommands The maximum commands to fetch
     */
    public getCommands(page: number, inDMS: boolean, maxCommands: number = 20) {
        let minIndex = (page - 1) * maxCommands;
        let commandCount = 0;
        return DiscordCommand.commands.filter(command => {
            // filter commands that are bot owner
            if (command.permissionLevel === "bot-owner") return false;
            // filter commands that can't be used in dms if in dms
            if (!command.allowInDMS && inDMS) return false;
            // filter commands that can't be used in servers if in a server
            if (!command.allowInServers && !inDMS) return false;
            // otherwise, valid
            return true;
        }).filter((_, index) => {
            // filter out commands not on this page
            if (index < minIndex) return false;
            if (commandCount >= maxCommands) return false;
            commandCount++;
            return true;
        });
    }

    public run(message: DiscordMessage): void {
        if (!message.messagingAllowed) return;

        let guild_data = message.guildData;
        let args = message.args;

        let translator = Translations.getLanguage(guild_data.options.language).helpCommand();

        let dms = (message.channel.type === "dm"
            // deprecated because no group channels exist
            /** || message.channel.type === "group" */);
        
        let lookupCommand: boolean;
        let page: number = 0;
        let commandName: string = "";

        if (args.length === 0) {
            lookupCommand = false;
            page = 1;
        }
        else {
            commandName = args.join(" ").trim();
            page = parseInt(commandName);

            if (isNaN(page)) {
                lookupCommand = true;
            }
            else {
                lookupCommand = false;
                if (page === 0) page++;
            }
        }

        let prefix = guild_data.options.prefix;
        let userData: UserData = global.fireStore.userData[message.author.id];
        if (userData === undefined) userData = global.fireStore.defaultUserData();

        if (lookupCommand) {

            let command = DiscordCommand.commands.filter((c) => {
                if (c.nsfw) {
                    if (message.channel.type === "dm") return userData.allowNSFW;
                    return ((message.channel as TextChannel).nsfw === true);
                }
                return true;
            }).find((c) => c.equals(commandName));

            if (command === undefined) {
                let embed = new MessageEmbed()
                    .setColor(embedColors.error)
                    .setTitle(`**${translator.lookupCommandErrorTitle()}**`)
                    .setDescription(translator.lookupCommandErrorDescription(commandName))
                    .setFooter(translator.lookupCommandErrorFooter())
                    .setTimestamp(Date.now());
                message.channel.send(embed)
            }
            else {
                let commandInfo = command.helpInfo;
                let embed = new MessageEmbed()
                    .setColor(embedColors.devilpink)
                    .setTitle(`__**${translator.commandInfoTitle(commandName)}**__`)
                    .setDescription(commandInfo.description)
                    .setTimestamp(Date.now());

                if (command.aliases.length > 0) {
                    if (commandName === command.id) { 
                        embed.addField(`**${translator.aliasCountTitle(command.aliases)}**`, 
                            translator.mainAliasField(command.id, command.aliases));
                    }
                    else {
                        embed.addField(`**${translator.aliasCountTitle(command.aliases)}**`, 
                            translator.aliasField(commandName, command.id, command.aliases));
                    }
                }

                embed.addField(`**${translator.usageCountTitle(commandInfo.usages)}**`, 
                    HelpCommand.generateUsages(commandInfo.usages, commandName, prefix));
                embed.addField(`**${translator.exampleCountTitle(commandInfo.examples)}**`,
                    HelpCommand.generateExamples(commandInfo.examples, commandName, prefix));
                /*embed.addField(`**Note**`,
                    `- A parameter surrounded by angle brackets (\`<>\`) is optional
- A parameter surrounded by square brackets (\`[]\`) is required
- A parameter with three dots before the name is a list of parameters.
    + This is a simplified way of writing \`you can put one or more parameters here\`.
- A parameter with an equals sign after the name, and a value is an optional parameter, but if not given defaults to that value`);*/

                message.channel.send(embed);
            }
        }
        else {
            let commandList = this.getCommands(page, dms).filter((c) => {
                if (c.nsfw) {
                    if (message.channel.type === "dm") return userData.allowNSFW;
                    return ((message.channel as TextChannel).nsfw === true);
                }
                return true;
            });

            let embed = new MessageEmbed()
                .setColor(embedColors.devilpink)
                .setTitle("__**Command List**__")
                .setDescription(`**TIP**\nUse \`${prefix}help <command>\` to view the full information of a \`command\`\nExample: \`${prefix}help prefix\``)
                .setTimestamp(Date.now());


            let index = 0, fields = 25;

            for (let length = commandList.length; index < length && index < fields; index++) {
                let command = commandList[index];
                embed.addField(`${prefix}${command.id}`, command.helpInfo.description, true);
            }

            for (; index % 3 > 0 && index < 25; index++) embed.addField("\u200B", "\u200B", true);

            message.channel.send(embed);
        }
    }

    /**
     * Generates the usage string for a given usage, command name, and prefix
     * @param usage The usage
     * @param commandName The name of the command
     * @param prefix The prefix
     */
    public static generateUsage(usage: HelpInfoUsage, commandName: string, prefix: string): string {
        let result = "`" + prefix + commandName;
        let parameters = usage.parameters;
        let info = usage.info.replace(/{([a-z0-9]+)}/g, (full: string, value: string) => {
            let paramNumber = parseInt(value);
            if (!isNaN(paramNumber)) {
                let parameter = parameters[paramNumber - 1];
                if (parameter != undefined) return parameter.name;
            }
            return full;
        });
        let description = `- ${info}`;
        if (parameters.length > 0) {
            result += " ";
            result += parameters.map(param => {
                description += `\n- \`${param.name}\` - ${param.info}`;

                let pre = "", post = "";

                if (param.optional) {
                    pre = "[";
                    post = "]";
                }
                else {
                    pre = "<";
                    post = ">";
                }
                if (param.isList) pre += "...";
                if (param.defaultValue !== undefined) post = "=" + param.defaultValue + post;
                return pre + param.name + post;
            }).join(" ");
        }
        return result + "`\n" + description;
    }

    /**
     * Generates a string from the list of usages given, with the name of the command and the prefix
     * @param usages The list of usages
     * @param commandName The name of the command
     * @param prefix The prefix
     */
    public static generateUsages(usages: HelpInfoUsage[], commandName: string, prefix: string): string {
        let result = "";
        for (let index = 0, length = usages.length; index < length; index++) {
            if (index > 0) result += "\n\n";

            let usage = usages[index];
            result += this.generateUsage(usage, commandName, prefix);
        }
        return result;
    }

    public static generateExample(example: HelpInfoExample, commandName: string, prefix: string): string {
        let result = "";
        let raw_message = example.raw_message.replace(/{([a-z0-9]+)}/g, (full: string, value: string) => {
            if (value === "prefix") return prefix;
            else if (value === "command") return commandName;
            else return full;
        });

        if (example.raw_message_full !== undefined && example.raw_message_full === true) {
            result = `\`${raw_message}\``;
        } 
        else {
            result = `\`${prefix}${commandName}`;
            if (raw_message.length > 0) result += " " + raw_message;
        }
        return result + `\`\n(${example.info})`;
    }

    public static generateExamples(examples: HelpInfoExample[], commandName: string, prefix: string): string {
        let result = "";
        for (let index = 0, length = examples.length; index < length; index++) {
            if (index > 0) result += "\n\n";

            let example = examples[index];
            result += this.generateExample(example, commandName, prefix);
        }
        return result;
    }
}