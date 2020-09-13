import DiscordCommand from "../DiscordCommand";
import { DiscordMessage } from "../../discord-wrappers/DiscordMessage";
import fetch from "node-fetch";

export default abstract class NekosLifeAPICommand extends DiscordCommand {

    /**
     * The endpoint relative to /api/v2
     */
    public abstract get endpoint(): string;

    /**
     * The json property key to get the text response from the json response
     */
    public abstract get responseKey(): string;

    public constructor(id: string, ...aliases: string[]) {
        super(id, ...aliases);
    }

    public async run(message: DiscordMessage): Promise<void> {
        if (!message.messagingAllowed) return;

        if (message.deletable) message.delete();

        let res = await fetch("https://nekos.life/api/v2/" + this.endpoint, {
            method: "GET"
        });

        let serverResponse: string = (await res.json())[this.responseKey];

        this.handleResponse(serverResponse, message);
    }

    /**
     * Handles the response once gotten from nekos.life
     * @param serverResponse The server response recieved
     * @param message The original message
     * @abstract
     */
    public abstract handleResponse(serverResponse: string, message: DiscordMessage): void;

}