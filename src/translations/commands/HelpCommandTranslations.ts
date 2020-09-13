import { HelpInfoUsage, HelpInfoExample } from "../../bot/commands/DiscordCommand";
import TranslationPath from "../TranslationPath";

export default abstract class HelpCommandTranslations implements TranslationPath {

    /**
     * The title for the the error embed whenever looking up
     * the help info for a command fails.
     */
    public abstract lookupCommandErrorTitle(): string;

    /**
     * The description for the error embed whenever looking up
     * the help info for a command fails.
     * @param commandName The name of the command that couldn't be looked up
     */
    public abstract lookupCommandErrorDescription(commandName: string): string;

    /**
     * The footer for the error embed whenever looking up
     * the help info for a command fails.
     */
    public abstract lookupCommandErrorFooter(): string;

    /**
     * The title for the command info embed
     * @param commandName The name of the command
     */
    public abstract commandInfoTitle(commandName: string): string;

    /**
     * The embed title for the aliases field of the command info
     * embed.
     * @param aliases The aliases
     */
    public abstract aliasCountTitle(aliases: string[]): string;

    /**
     * Called whenever the the help info was requested using the command id
     * instead of an alias
     * @param commandID The ID of the command
     * @param aliases The aliases for the command
     */
    public abstract mainAliasField(commandID: string, aliases: string[]): string;

    /**
     * Called whenever the the help info was requested using one of the aliases
     * of the command instead of the command id
     * @param alias The alias used
     * @param commandID The ID of the command
     * @param aliases The aliases for the command
     */
    public abstract aliasField(alias: string, commandID: string, aliases: string[]): string;

    /**
     * The embed title for the usages field of the command info
     * @param usages The usages of the command
     */
    public abstract usageCountTitle(usages: HelpInfoUsage[]): string;

    /**
     * The embed title for the examples field of the command info
     * @param examples The examples of the command
     */
    public abstract exampleCountTitle(examples: HelpInfoExample[]): string;

    // commandListTip

    // commandListTitle

    public resolve(path: string, ...args: any[]): string {
        let paths = path.split(".");
        let option = paths.splice(0, 1)[0];
        let newPath = paths.join(".");

        switch (option) {
            case "lookup_command_error_title":
                return this.lookupCommandErrorTitle();
            case "lookup_command_error_description":
                return this.lookupCommandErrorDescription(args[0]);
            case "lookup_command_error_footer":
                return this.lookupCommandErrorFooter();
            case "command_info_title":
                return this.commandInfoTitle(args[0]);
            case "alias_count_title": 
                return this.aliasCountTitle(args[0]);
            case "main_alias_field":
                return this.mainAliasField(args[0], args[1]);
            case "alias_field":
                return this.aliasField(args[0], args[1], args[2]);
            case "usage_count_title":
                return this.usageCountTitle(args[0]);
            case "example_count_title":
                return this.exampleCountTitle(args[0]);
            default:
                throw new Error("The given path does not exist");
        }
    }
}