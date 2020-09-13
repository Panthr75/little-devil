import DiscordCommand, { PermissionLevel, HelpInfo } from "../DiscordCommand";
import { Util } from "discord.js";
import { DiscordMessage } from "../../discord-wrappers/DiscordMessage";

export default class EightBallCommand extends DiscordCommand {

    private readonly _biggestFortuneLength: number;

    public get permissionLevel(): PermissionLevel {
        return "none";
    }

    public get allowInDMS(): boolean {
        return true;
    }

    public get allowInServers(): boolean {
        return true;
    }

    public get exactPermissionLevel(): boolean {
        return false;
    }

    public get helpInfo(): HelpInfo {
        return {
            "description": "Gives a prediction from a specified yes or no question/statement.",
            "usages": [
                {
                    "info": "Gives a prediction from the given question",
                    "parameters": [
                        {
                            "name": "question",
                            "isList": true,
                            "optional": false,
                            "info": "The yes or no question"
                        }
                    ]
                }
            ],
            "examples": [
                {
                    "info": this.fortune,
                    "raw_message": "is little devil the best bot ever?"
                }
            ]
        }
    }

    /** The list of fortunes */
    public get fortunes(): string[] {
        return [
            // try again
            "Ask again later", 
            "Cannot predict now",

            // neutral
            "Maybe", 
            "It's a possibility",

            // yes
            "Signs point to yes", 
            "Definitely", 
            "It is certain", 
            "Without doubt",

            // no
            "Don't count on it",
            "My sources say no",
            "Outlook not so good",
            "Very doubtful"
        ];
    }

    /** Gets a random fortune */
    public get fortune(): string {
        let fortunes = this.fortunes;
        return fortunes[Math.floor(Math.random() * fortunes.length)];
    }

    /** The length of the longest fortune message */
    get biggestFortuneLength(): number {
        return this._biggestFortuneLength;
    }

    /** The list of thinking messages */
    get thinkingMessages(): string[] {
        return [
            "Hmmm",
            "Hmmm",
            "Hmmm",
            "Hmmm",
            "Hmmm",
            "This one's a tough one",
            "Awaiting magical ball",
            "Performing quick maffs",
            "Shaking fortune dispensor",
            "Analyzing the waves of space-time",
            "<insert funny joke here>",
            "Extracting exotic matter..."
        ];
    }

    /** Gets a random thinking message */
    public get thinkingMessage(): string {
        let thinkingMessages = this.thinkingMessages;
        return thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
    }

    /** The minimum amount of time (in ms) the bot can "think" of a prediction */
    public get minThinkTime(): number {
        return 2000;
    }

    /** The maximum amount of time (in ms) the bot can "think" of a prediction */
    public get maxThinkTime(): number {
        return 5000;
    }

    /** Gets a random think time */
    public get thinkTime(): number {
        return Math.floor(Math.random() * (this.maxThinkTime - this.minThinkTime)) + this.minThinkTime;
    }

    public constructor() {
        super("8ball", "eightball");

        this._biggestFortuneLength = this.fortunes.reduce((l, f) => f.length > l ? f.length : l, 0);
    }

    public needsPrefix(): boolean {
        return true;
    }

    public run(message: DiscordMessage): void {
        let question = message.args.join(" ").trim();

        if (!message.messagingAllowed) return;

        if (question.length === 0) {
            message.channel.send(":no_entry: Please ask a yes or no question/statement so I can make a prediction!");
        }
        else {
            let fortune = this.fortune;
            let thinkTime = this.thinkTime;
            let thinkMessage = this.thinkingMessage;
            let raw_question = Util.escapeMarkdown(question);

            // TODO: Create seperate class to handle errors from unhandled promise rejections instead of
            //       using an empty function

            message.channel.send(`> ${raw_question}\n:hourglass: **${thinkMessage}** :thinking:`)
                .then(sentMessage => {
                    message.client.setTimeout(() => {
                        sentMessage.edit(`> ${raw_question}\n:speech_balloon: ||\`${fortune.padEnd(this.biggestFortuneLength, " ")}\`||`).catch(() => {});
                    }, thinkTime);
                })
                .catch(() => {});
        }
    }
}