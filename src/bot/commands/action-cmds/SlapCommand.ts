import BaseActionCommand, { ActionType, ActionMessage } from "./BaseActionCommand";
import { HelpInfo } from "../DiscordCommand";
import { User } from "discord.js";
import Translation from "../../../translations/Translation";
import LittleDevilClient from "../../discord-wrappers/LittleDevilClient";

export default class SlapCommand extends BaseActionCommand {
    
    private readonly _attachments: string[];

    public get attachmentChannelID(): string {
        return "715306391107141723";
    }

    public get attachments(): string[] {
        return this._attachments.slice();
    }

    public get helpInfo(): HelpInfo {
        return {
            "description": "Slaps you, a member, or a list of members",
            "usages": [
                {
                    "info": "You receive a slap from the bot",
                    "parameters": []
                },
                {
                    "info": "Slaps `user`",
                    "parameters": [
                        {
                            "info": "The username, or mention of the user wanted to be slapped",
                            "optional": false,
                            "name": "user",
                            "isList": false
                        }
                    ]
                },
                {
                    "info": "Slaps `users`",
                    "parameters": [
                        {
                            "info": "A list of usernames or mentions",
                            "isList": true,
                            "optional": false,
                            "name": "users"
                        }
                    ]
                }
            ],
            "examples": [
                {
                    "info": "You receive a slap from me",
                    "raw_message": ""
                },
                {
                    "info": "Slaps `YourBestFriend`",
                    "raw_message": "@YourBestFriend"
                },
                {
                    "info": "Slaps `Lorttexwolf` and `YourBestFriend`",
                    "raw_message": "Lorttexwolf @YourBestFriend"
                }
            ]
        }
    }

    public constructor() {
        super("slap");

        let attachments = {
            "wIbu": "715306479896363069",
            "T3n1": "715306501161353226",
            "xhlc": "715306506496507944",
            "T3nh": "715306509201834097",
            "E1MC": "715306511949103245",
            "15144612": "731039092493647953"
        } as {
            [x: string]: string | undefined
        };

        this._attachments = Object.keys(attachments).map((a) => {
            return `${this.attachmentChannelID}/${attachments[a]}/${a}.gif`;
        });
    }

    public getActionCommand(client: LittleDevilClient, type: ActionType, instantiator: User, targets: User[], translation: Translation): ActionMessage {
        let translator = translation.slapCommand();
        if (type === "single") {
            return {
                "successful": true,
                "message": translator.singleUserSlap(instantiator)
            };
        }
        else {
            if (targets.length === 0) {
                return {
                    "successful": false,
                    "message": translator.userNotFound()
                };
            }
            else {
                let addCommands = targets.length > 2;
                let andIndex = targets.length - 1 + (targets.length === 1 ? 1 : 0);
                let users = targets.map((target, index) => {
                    let user = "";
                    if (index === andIndex) user += "and ";
                    user += "**" + target.username + "**";
                    if (addCommands && index < andIndex) user += ",";
                    return user;
                });
                let message = translator.slap(users, instantiator);
                return {
                    "message": message,
                    "successful": true
                };
            }
        }
    }
}