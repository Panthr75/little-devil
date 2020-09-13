import DiscordCommand, { PermissionLevel, HelpInfo } from "../DiscordCommand";
import { DiscordMessage } from "../../discord-wrappers/DiscordMessage";


/**
 * The flip command
 */
export default class FlipCommand extends DiscordCommand {
    get permissionLevel(): PermissionLevel {
        return "none";
    }

    get allowInDMS(): boolean {
        return true;
    }

    get allowInServers(): boolean {
        return true;
    }

    get exactPermissionLevel(): boolean {
        return false;
    }

    get helpInfo(): HelpInfo {
        return {
            "description": "Flips a coin",
            "usages": [
                {
                    "info": "Flips a coin",
                    "parameters": []
                }
            ],
            "examples": [
                {
                    "info": "Sends either `Heads` or `Tails`",
                    "raw_message": ""
                }
            ]
        }
    }

    /**
     * Instantiates a new Flip Command
     */
    public constructor() {
        super("flip");
    }

    public needsPrefix() {
        return true;
    }

    public run(message: DiscordMessage) {
        if (!message.messagingAllowed) return;
        let outcomes = ["Heads", "Tails"];
        let outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

        message.channel.send(outcome);
    }
}