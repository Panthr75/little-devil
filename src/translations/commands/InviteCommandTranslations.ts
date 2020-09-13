import TranslationPath from "../TranslationPath";

export default abstract class InviteCommandTranslations implements TranslationPath {

    /**
     * Gets the invite info with the given link
     * @param link The link
     */
    public abstract getInvite(link: string): string;

    public resolve(path: string, ...args: any[]): string {
        let paths = path.split(".");
        let option = paths.splice(0, 1)[0];
        let newPath = paths.join(".");

        switch (option) {
            case "get_invite":
                return this.getInvite(args[0]);
            default:
                throw new Error("The given path does not exist");
        }
    }
}