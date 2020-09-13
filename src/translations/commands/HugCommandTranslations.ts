import { User } from "discord.js";
import TranslationPath from "../TranslationPath";

export default abstract class HugCommandTranslations implements TranslationPath {

    /**
     * The message for when a user uses the hug command without any argument,
     * thus the bot hugs them.
     * 
     * Discord markdown is recommended
     * @param user The user who was hugged
     */
    public abstract singleUserHug(user: User): string;

    /**
     * The message for when no users were found to hug
     */
    public abstract userNotFound(): string;

    /**
     * Gets the message for the hug command
     * @param users The users who were hugged. They are already pre-formatted
     * @param instantiator The user who hugged the users
     */
    public abstract hug(users: string[], instantiator: User): string;

    public resolve(path: string, ...args: any[]): string {
        let paths = path.split(".");
        let option = paths.splice(0, 1)[0];
        let newPath = paths.join(".");

        switch (option) {
            case "single_user_hug":
                return this.singleUserHug(args[0]);
            case "user_not_found":
                return this.userNotFound();
            case "hug":
                return this.hug(args[0], args[1]);
            default:
                throw new Error("The given path does not exist");
        }
    }
}