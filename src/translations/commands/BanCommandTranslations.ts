import TranslationPath from "../TranslationPath";

export default abstract class BanCommandTranslations implements TranslationPath {
    /** 
     * The title for a BAN ERROR embed
     */
    public abstract banError(): string;

    /** 
     * The text for when the provided username can't be banned
     * @param username The username of the user that can't be banned
     */
    public abstract cantBanUser(username: string): string;

    /** 
     * The text when a user couldn't be found
     */
    public abstract cantFindUser(): string;

    /** 
     * The text for when a member is banned
     */
    public abstract memberBanned(): string;

    /** 
     * The text for the info of a member being banned
     * @param username The username of the member being banned
     * @param reason The reason why the member is being banned
     */
    public abstract memberBannedInfo(username: string, reason: string): string;

    /** 
     * The text for when a ban was failed. Is passed the tag (username#discriminator) of 
     * the member that was failed to be banned
     * @param tag The tag of the member that was failed to be banned
     */
    public abstract failedBan(tag: string): string;

    /** 
     * The message sent to an individual when they are banned. Requires the name of 
     * the guild, and the reason of why they were banned
     * @param guildName The name of the guild
     * @param reason The reason for the ban
     */
    public abstract banMessage(guildName: string, reason: string): string;

    public resolve(path: string, ...args: any[]): string {
        let paths = path.split(".");
        let option = paths.splice(0, 1)[0];
        let newPath = paths.join(".");

        switch (option) {
            case "ban_error":
                return this.banError();
            case "cant_ban_user":
                return this.cantBanUser(args[0]);
            case "cant_find_user":
                return this.cantFindUser();
            case "member_banned":
                return this.memberBanned();
            case "member_banned_info":
                return this.memberBannedInfo(args[0], args[1]);
            case "failed_ban":
                return this.failedBan(args[0]);
            case "ban_message":
                return this.banMessage(args[0], args[1]);
            default:
                throw new Error("The given path does not exist");
        }
    }
}