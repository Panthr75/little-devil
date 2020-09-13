import { Snowflake, User } from "discord.js";
import Deck from "../../Deck";
import PlayingCard, { PlayingCardType, PlayingCardValue } from "../../PlayingCard";
import WarGame from "../WarGame";
import WarPlayer from "../WarPlayer";
import WarPlayerTurn from "../WarPlayerTurn";
import WarGameSession from "./WarGameSession";

export type DiscordWarPlayerCardJSON = {
    type: PlayingCardType,
    value: PlayingCardValue
}

export type DiscordWarPlayerDeckJSON = DiscordWarPlayerCardJSON[];

export type DiscordWarPlayerJSON = {
    wonCards: DiscordWarPlayerCardJSON[],
    deck: DiscordWarPlayerDeckJSON,
    user: Snowflake
}

export default class DiscordWarPlayer extends WarPlayer {

    /** The session this player is in */
    public readonly session: WarGameSession;

    public readonly user: string;

    public get discordUser(): User | undefined {
        return this.session.users.find(user => user.id === this.user);
    }

    public constructor(session: WarGameSession, user: string) {
        super();

        this.session = session;
        this.user = user;
    }

    /** Converts this Discord War Player to a JSON object */
    public toJSON(): DiscordWarPlayerJSON {
        return {
            "wonCards": this.wonCards.map(card => { return { "type": card.type, "value": card.value } }),
            // @ts-ignore
            "deck": this.deck._cards.map(card => { return { "type": card.type, "value": card.value } }),
            "user": this.user
        }
    }

    public static fromJSON(json: DiscordWarPlayerJSON, session: WarGameSession): DiscordWarPlayer {
        let player = new DiscordWarPlayer(session, json.user);

        if (session.game !== null) {
            // @ts-ignore
            player._game = session.game;
            session.game.players.push(player);
        }

        player.wonCards = json.wonCards.map(wonCardJSON => new PlayingCard(wonCardJSON.type, wonCardJSON.value));
        player.deck = new Deck();
        json.deck.forEach(cardJSON => {
            // @ts-ignore
            player.deck._cards.push(new PlayingCard(cardJSON.type, cardJSON.value));
        });

        return player;
    }
}