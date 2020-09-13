import { Channel, Message, MessageEmbed, Snowflake, TextBasedChannelFields, User } from "discord.js";
import { replaceEmojis } from "../../../../command-utils";
import LittleDevilClient from "../../../../discord-wrappers/LittleDevilClient";
import embedColors from "../../../../embed-colors";
import { PlayingCardType } from "../../PlayingCard";
import WarGame from "../WarGame";
import WarPlayer from "../WarPlayer";
import WarPlayerTurn from "../WarPlayerTurn";
import DiscordWarPlayer, { DiscordWarPlayerJSON } from "./DiscordWarPlayer";

enum WarGameState {
    NONE,
    PLAYING
};

export type WarGameSessionJSON = {
    state: WarGameState,
    users: Snowflake[],
    players: DiscordWarPlayerJSON[],
    channel: Snowflake
};

let CardTypeMessage: { [x: number]: string } = {
    "1": "♦️",
    "2": "♥️",
    "3": "♠️",
    "4": "♣️"
}

let CardValueMessage: { [x: number]: string } = {
    "1": "A",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "10": "10",
    "11": "J",
    "12": "Q",
    "13": "K"
}

export default class WarGameSession {

    private state: WarGameState;

    /** The users of this war game session */
    public users: User[];

    /** The players of this session */
    public players: DiscordWarPlayer[];

    /** The actual war game */
    public game: WarGame | null;

    /** The channel this game takes place in */
    public readonly channel: Channel & TextBasedChannelFields

    /** The client of this session */
    public readonly client: LittleDevilClient;

    public get warGameTimeout(): number {
        return 60000;
    }

    private bindedOnMessageFN: (this: WarGameSession, message: Message) => void;

    public constructor(client: LittleDevilClient, channel: Channel & TextBasedChannelFields) {
        this.users = [];
        this.state = WarGameState.NONE;
        this.client = client;
        this.channel = channel;
        this.players = [];
        this.game = null;

        this.bindedOnMessageFN = this.onMessage.bind(this);
        client.client.on("message", this.bindedOnMessageFN);
    }

    public onMessage(message: Message) {
        if (message.author.bot) return;

        if (message.channel.id === this.channel.id) {
            if (this.state === WarGameState.NONE) {
                let command = message.content.toLowerCase();
                if (command === "start") {
                    if (this.users.length > 0 && this.users[0].id === message.author.id) {
                        this.start();
                    }
                    else {
                        message.channel.send(replaceEmojis(":redtick: Only the host can start the game.\n\n(Host, you can use `cancel` to cancel this game)"));
                    }
                }
                else if (command === "cancel") {
                    if (this.users.length > 0 && this.users[0].id === message.author.id) {
                        this.cleanup();
                    }
                    else {
                        message.channel.send(replaceEmojis(":redtick: Only the host can cancel the game."));
                    }
                }
                if (command === "join") {
                    if (this.users.some((user) => user.id === message.author.id)) message.channel.send(replaceEmojis(":redtick: You already have joined this war game"));
                    this.users.push(message.author);
                }
            }
        }
    }

    public onTurn(turns: WarPlayerTurn[], _playerThatWon: WarPlayer) {
        let playerThatWon = _playerThatWon as DiscordWarPlayer;
        let cards = turns.map(turn => `${CardValueMessage[turn.card.value]}${CardTypeMessage[turn.card.type]} - ${(turn.player as DiscordWarPlayer).discordUser}`);
        let embed = new MessageEmbed()
            .setColor(embedColors.devilpink)
            .setTitle("**WAR**")
            .setDescription(`Player that won: ${playerThatWon.discordUser!.username}`)
            .addField("__Played Cards__", cards.join("\n"));
        this.channel.send(embed);
    }

    public cleanup() {
        this.users = [];
        this.players = [];
        this.game = null;
        this.client.client.removeListener("message", this.bindedOnMessageFN);
    }

    public start() {
        if (this.state === WarGameState.PLAYING) return;

        try {
            this.game = new WarGame(...this.players);
        }
        catch(_) {
            return;
        }
        this.game.onTurn = this.onTurn;

        this.state = WarGameState.PLAYING;
    }

    public doTurn() {
        if (this.state === WarGameState.PLAYING) {
            this.game!.doTurn();
        }
    }

    /** Converts this session to JSON */
    public toJSON(): WarGameSessionJSON {
        return {
            "state": this.state,
            "users": this.users.map(user => user.id),
            "players": this.players.map(player => player.toJSON()),
            "channel": this.channel.id
        };
    }

    public static fromJSON(json: WarGameSessionJSON, client: LittleDevilClient): WarGameSession {
        let channelID: Snowflake = json.channel;

        let potentialChannel: Channel | undefined = client.channels.cache.get(channelID);

        if (potentialChannel === undefined) throw new Error("Could not resolve channel from given channel ID");
        if (potentialChannel.type !== "news" && potentialChannel.type !== "text") throw new Error("The resolved channel is not valid for a game session");
        let channel = potentialChannel as Channel & TextBasedChannelFields;

        let gameSession = new WarGameSession(client, channel);
        gameSession.users = json.users.map(userID => {
            let user = client.users.resolve(userID);
            if (user === null) throw new Error("Could not resolve user from given user id '" + userID + "'");
            return user;
        });
        if (json.state === WarGameState.PLAYING) {
            gameSession.game = new WarGame();
        }
        gameSession.players = json.players.map(playerJSON => DiscordWarPlayer.fromJSON(playerJSON, gameSession));

        return gameSession;
    }
}