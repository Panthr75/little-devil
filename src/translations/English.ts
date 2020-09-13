import Translation from "./Translation";
import BanCommandTranslations from "./commands/BanCommandTranslations";
import BalanceCommandTranslations from "./commands/BalanceCommandTranslations";
import { User } from "discord.js";
import { GuildEconomyCurrencyOptions } from "../firebase";
import { formatMoney } from "../bot/command-utils";
import SlapCommandTranslations from "./commands/SlapCommandTranslations";
import HugCommandTranslations from "./commands/HugCommandTranslations";
import HelpCommandTranslations from "./commands/HelpCommandTranslations";
import { HelpInfoUsage, HelpInfoExample } from "../bot/commands/DiscordCommand";
import InviteCommandTranslations from "./commands/InviteCommandTranslations";
import DailyCommandTranslations from "./commands/DailyCommandTranslations";

export class EnglishBalanceCommandTranslations extends BalanceCommandTranslations {
    public userBalance(user: User): string {
        return `${user.username}'s Balance`;
    }

    public totalMoney(amount: number, currency: GuildEconomyCurrencyOptions): string {
        return `**Total Money**: ${formatMoney(amount, currency)}`;
    }

    public userNotFound(): string {
        return "Sorry, but I couldn't find the user given";
    }
}

export class EnglishBanCommandTranslations extends BanCommandTranslations {

    public banError(): string {
        return "BAN ERROR";
    }

    public cantBanUser(username: string): string {
        return `Sorry, but I can't ban \`${username}\``;
    }

    public cantFindUser(): string {
        return "Sorry, but I couldn't find the user specified";
    }

    public memberBanned(): string {
        return "Member Banned";
    }

    public memberBannedInfo(username: string, reason: string): string {
        return `\`${username}\` was just banned: ${reason}`;
    }

    public failedBan(tag: string): string {
        return `I wasn't able to ban \`${tag}\`!`;
    }

    public banMessage(guildName: string, reason: string): string {
        return `You've been banned in ${guildName}:\`\`\`\n${reason}\`\`\``;
    }
}

export class EnglishDailyCommandTranslations extends DailyCommandTranslations {
    


}

export class EnglishHelpCommandTranslations extends HelpCommandTranslations {
    
    public lookupCommandErrorTitle(): string {
        return "Error";
    }

    public lookupCommandErrorDescription(commandName: string): string {
        return `Could not find the help for command \`${commandName}\``;
    }

    public lookupCommandErrorFooter(): string {
        return "Be sure to check for spelling mistakes!";
    }

    public commandInfoTitle(commandName: string): string {
        return commandName;
    }

    public aliasCountTitle(aliases: string[]): string {
        return `Aliases (${aliases.length})`;
    }

    public mainAliasField(commandID: string, aliases: string[]): string {
        return `__**\`${commandID}\`**__, \`${aliases.join("`, `")}\``;
    }

    public aliasField(alias: string, commandID: string, aliases: string[]): string {
        return `__\`${commandID}\`__, ${aliases.map((c) => {
            if (c === alias) return `**\`${c}\`**`;
            return `\`${c}\``;
        }).join(", ")}`;
    }

    public usageCountTitle(usages: HelpInfoUsage[]): string {
        return `Usages (${usages.length})`;
    }

    public exampleCountTitle(examples: HelpInfoExample[]): string {
        return `Examples (${examples.length})`;
    }
}

export class EnglishHugCommandTranslations extends HugCommandTranslations {

    public singleUserHug(user: User): string {
        return `**${user.username}**, here's a hug!`;
    }

    public userNotFound(): string {
        return "Couldn't find the user's specified to hug";
    }

    public hug(users: string[], instantiator: User): string {
        return `${users.join(" ")}, here's a hug from **${instantiator.username}**!`;
    }
}

export class EnglishInviteCommandTranslations extends InviteCommandTranslations {
    
    public getInvite(link: string): string {
        return `*Click [here](${link})*`;
    }
}

export class EnglishSlapCommandTranslations extends SlapCommandTranslations {

    public singleUserSlap(user: User): string {
        return `**${user.username}**, here's a slap!`;
    }

    public userNotFound(): string {
        return "Couldn't find the user's specified to slap";
    }

    public slap(users: string[], instantiator: User): string {
        return `${users.join(" ")}, you've been slapped by **${instantiator.username}**!`;
    }
}

export default class English extends Translation {

    private readonly _balanceCommand: EnglishBalanceCommandTranslations;
    private readonly _banCommand: EnglishBanCommandTranslations;
    private readonly _dailyCommand: EnglishDailyCommandTranslations;
    private readonly _helpCommand: EnglishHelpCommandTranslations;
    private readonly _hugCommand: EnglishHugCommandTranslations;
    private readonly _inviteCommand: EnglishInviteCommandTranslations;
    private readonly _slapCommand: EnglishSlapCommandTranslations;

    public balanceCommand(): BalanceCommandTranslations {
        return this._balanceCommand;
    }
    
    public banCommand(): BanCommandTranslations {
        return this._banCommand;
    }

    public dailyCommand(): DailyCommandTranslations {
        return this._dailyCommand;
    }

    public helpCommand(): HelpCommandTranslations {
        return this._helpCommand;
    }

    public hugCommand(): HugCommandTranslations {
        return this._hugCommand;
    }

    public inviteCommand(): InviteCommandTranslations {
        return this._inviteCommand;
    }

    public slapCommand(): SlapCommandTranslations {
        return this._slapCommand;
    }

    public economyNotEnabled(): string {
        return "Sorry, but economy is not enabled on this server!";
    }

    public constructor() {
        super("en");

        this._balanceCommand = new EnglishBalanceCommandTranslations();
        this._banCommand = new EnglishBanCommandTranslations();
        this._dailyCommand = new EnglishDailyCommandTranslations();
        this._helpCommand = new EnglishHelpCommandTranslations();
        this._hugCommand = new EnglishHugCommandTranslations();
        this._inviteCommand = new EnglishInviteCommandTranslations();
        this._slapCommand = new EnglishSlapCommandTranslations();
    }
}