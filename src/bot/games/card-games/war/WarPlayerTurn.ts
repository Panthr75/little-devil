import PlayingCard, { PlayingCardValue } from "../PlayingCard";
import WarPlayer from "./WarPlayer";


export default class WarPlayerTurn {

    public readonly player: WarPlayer;
    public readonly card: PlayingCard;

    public constructor(player: WarPlayer, card: PlayingCard) {
        this.player = player;
        this.card = card;
    }

    public isTurnBetter(turn: WarPlayerTurn): boolean {
        if (this.card.value === PlayingCardValue.ACE) return turn.card.value === PlayingCardValue.ACE;
        else if (turn.card.value === PlayingCardValue.ACE) return true;
        else return this.card.value <= turn.card.value;
    }

    public isWar(turn: WarPlayerTurn): boolean {
        return this.card.value === turn.card.value;
    }

    public giveWinningCards(cards: PlayingCard[]) {
        this.player.wonCards.push(...cards);
    }
}