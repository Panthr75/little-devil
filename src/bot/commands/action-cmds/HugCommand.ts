import BaseActionCommand, { ActionType, ActionMessage } from "./BaseActionCommand";
import { HelpInfo } from "../DiscordCommand";
import { User } from "discord.js";
import Translation from "../../../translations/Translation";
import LittleDevilClient from "../../discord-wrappers/LittleDevilClient";

export default class HugCommand extends BaseActionCommand {

    private readonly _attachments: string[]

    public get attachmentChannelID(): string {
        return "715294097157652481";
    }

    public get attachments(): string[] {
        return this._attachments.slice();
    }

    public get helpInfo(): HelpInfo {
        return {
            "description": "Hugs you, a member, or a list of members",
            "usages": [
                {
                    "info": "You receive a hug from the bot",
                    "parameters": []
                },
                {
                    "info": "Hugs `user`",
                    "parameters": [
                        {
                            "info": "The username, or mention of the user wanted to be hugged",
                            "optional": false,
                            "name": "user",
                            "isList": false
                        }
                    ]
                },
                {
                    "info": "Hugs `users`",
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
                    "info": "You receive a hug from me",
                    "raw_message": ""
                },
                {
                    "info": "Hugs `YourBestFriend`",
                    "raw_message": "@YourBestFriend"
                },
                {
                    "info": "Hugs `Lorttexwolf` and `YourBestFriend`",
                    "raw_message": "Lorttexwolf @YourBestFriend"
                }
            ]
        };
    }

    public constructor() {
        super("hug");

        let attachments = {
            "2e1d34d002d73459b6119d57e6a795d6": "715294605846904912",
            "xJlOdEYy0r7ZS": "715294620833021992",
            "vQcO": "715294641284448356",
            "FQNP": "715294648918081636",
            "1059f68239cb86bd147c8cf745792433": "715294652369993788",
            "happy-hug-od5H3PmEG5EVq": "715294669399130172",
            "f9e934cddfd6fefe0079ab559ef32ab4": "715294678546907268",
            "QWw1": "715294703138111499",
            "ETCF": "715294713502236692",
            "PM3W": "715294729478209637",
            "tumblr_80a8c75d512a8d4e0007f6bf52be64a0_01133da1_500": "715294730274996355",
            "274281308": "715294736692281434",
            "v47M1S4": "715294750206591016",
            "UDdM": "715294750382489721",
            "MLKl": "715294761023438979",
            "q3kYEKHyiU4kU": "715294764060246036",
            "7lZ6": "717861828977492008"
        } as {
            [x: string]: string | undefined
        }

        this._attachments = Object.keys(attachments).map((a) => {
            return `${this.attachmentChannelID}/${attachments[a]}/${a}.gif`;
        });
    }

    public getActionCommand(client: LittleDevilClient, type: ActionType, instantiator: User, targets: User[], translation: Translation): ActionMessage {
        let translator = translation.hugCommand();
        if (type === "single") {
            return {
                "successful": true,
                "message": translator.singleUserHug(instantiator)
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
                let message = translator.hug(users, instantiator);
                return {
                    "message": message,
                    "successful": true
                };
            }
        }
    }
}