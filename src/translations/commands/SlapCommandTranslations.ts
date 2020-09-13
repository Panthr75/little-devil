import { User } from "discord.js";
import TranslationPath from "../TranslationPath";

export default abstract class SlapCommandTranslations implements TranslationPath {

    /**
     * The message for when a user uses the slap command without any argument,
     * thus the bot slaps them.
     * 
     * Discord markdown is recommended
     * @param user The user who was slapped
     */
    public abstract singleUserSlap(user: User): string;

    /**
     * The message for when no users were found to slap
     */
    public abstract userNotFound(): string;

    /**
     * Gets the message for the slap command
     * @param users The users who were slapped. They are already pre-formatted
     * @param instantiator The user who slapped the users
     */
    public abstract slap(users: string[], instantiator: User): string;

    public resolve(path: string, ...args: any[]): string {
        let paths = path.split(".");
        let option = paths.splice(0, 1)[0];
        let newPath = paths.join(".");

        switch (option) {
            case "single_user_slap":
                return this.singleUserSlap(args[0]);
            case "user_not_found":
                return this.userNotFound();
            case "slap":
                return this.slap(args[0], args[1]);
            default:
                throw new Error("The given path does not exist");
        }
    }
}