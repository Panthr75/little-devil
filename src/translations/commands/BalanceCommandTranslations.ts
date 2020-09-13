import { User } from "discord.js";
import { GuildEconomyCurrencyOptions } from "../../firebase";
import TranslationPath from "../TranslationPath";

export default abstract class BalanceCommandTranslations implements TranslationPath {
    
    /**
     * Returns a string for the title of the User Balance embed.
     * @param user The user who's balance was gotten
     */
    public abstract userBalance(user: User): string;

    /**
     * Returns the text containing the info of the total money.
     * Discord markdown should be used!
     * @param amount The amount of money
     * @param currency The currency of the guild
     */
    public abstract totalMoney(amount: number, currency: GuildEconomyCurrencyOptions): string;

    /**
     * The text for when a user was not found
     */
    public abstract userNotFound(): string;

    public resolve(path: string, ...args: any[]): string {
        let paths = path.split(".");
        let option = paths.splice(0, 1)[0];
        let newPath = paths.join(".");

        switch (option) {
            case "user_balance":
                return this.userBalance(args[0]);
            case "total_money":
                return this.totalMoney(args[0], args[1]);
            case "user_not_found":
                return this.userNotFound();
            default:
                throw new Error("The given path does not exist");
        }
    }
}