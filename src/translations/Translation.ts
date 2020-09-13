import BanCommandTranslations from "./commands/BanCommandTranslations";
import BalanceCommandTranslations from "./commands/BalanceCommandTranslations";
import SlapCommandTranslations from "./commands/SlapCommandTranslations";
import HugCommandTranslations from "./commands/HugCommandTranslations";
import HelpCommandTranslations from "./commands/HelpCommandTranslations";
import InviteCommandTranslations from "./commands/InviteCommandTranslations";
import DailyCommandTranslations from "./commands/DailyCommandTranslations";
import TranslationPath from "./TranslationPath";

/**
 * Represents a translation for a specific language
 */
export default abstract class Translation implements TranslationPath {

    /** The balance command translations */
    public abstract balanceCommand(): BalanceCommandTranslations;

    /** The ban command translations */
    public abstract banCommand(): BanCommandTranslations;

    /** The daily command translations */
    public abstract dailyCommand(): DailyCommandTranslations;

    /** The help command translations */
    public abstract helpCommand(): HelpCommandTranslations;

    /** The hug command translations */
    public abstract hugCommand(): HugCommandTranslations;

    /** The invite command translations */
    public abstract inviteCommand(): InviteCommandTranslations;

    /** The slap command translations */
    public abstract slapCommand(): SlapCommandTranslations;

    /** The message for when the economy is not enabled for a specific guild */
    public abstract economyNotEnabled(): string;

    /** The name of the language this translation is for */
    public readonly name: string;

    

    public resolve(path: string, ...args: any[]): string {
        let paths = path.split(".");
        let option = paths.splice(0, 1)[0];
        let newPath = paths.join(".");

        switch (option) {
            case "balance_command":
                return this.balanceCommand().resolve(newPath, ...args);
            case "ban_command":
                return this.banCommand().resolve(newPath, ...args);
            case "help_command":
                return this.helpCommand().resolve(newPath, ...args);
            case "hug_command":
                return this.hugCommand().resolve(newPath, ...args);
            case "invite_command":
                return this.inviteCommand().resolve(newPath, ...args);
            case "slap_command":
                return this.slapCommand().resolve(newPath, ...args);
            case "economy_not_enabled":
                return this.economyNotEnabled();
            default:
                throw new Error("The given path does not exist");
        }
    }


    /**
     * Instantiates a new Translation
     * @param name The name of the language
     */
    public constructor(name: string) {
        this.name = name;
    }
}