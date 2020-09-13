import Deck from "../Deck";
import PlayingCard from "../PlayingCard";
import WarGame from "./WarGame";
import WarPlayerTurn from "./WarPlayerTurn";


export default class WarPlayer {
    
    private _game: WarGame | null = null;

    public deck: Deck;
    public wonCards: PlayingCard[];

    public get game(): WarGame {
        return this._game!;
    }

    /** 
     * Returns whether or not the player
     * has lost the war game, checking their deck
     * and the wonCards array
     */
    public get lost(): boolean {
        return this.deck.count === 0 && this.wonCards.length === 0;
    }

    public constructor() {
        this.deck = new Deck();
        this.wonCards = [];
    }

    public doTurn(): WarPlayerTurn {
        if (this.lost) throw new Error("Player already lost");

        if (this.deck.count === 0) {
            for (let index = 0, length = this.wonCards.length; index < length; index++) {
                this.deck.pushBottom(this.wonCards[index]);
            }
            this.wonCards = [];
            this.deck.shuffle();
        }

        return new WarPlayerTurn(this, this.deck.pop()!);
    }

    /** 
     * Does the war, by returning the game specified face-down cards, with the 
     * last card being face-up. 
     * 
     * The face-up card is the last card in the array. 
     * 
     * When using this method, is recommended that the length of the array is equal to the game-specified face-up cards + 1 
     */
    public doWar(): WarPlayerTurn[] {
        let result: WarPlayerTurn[] = [];

        for (let index = 0, length = this.game.warCardCount + 1; index < length; index++) {
            if (this.lost) break;
            result.push(this.doTurn());
        }

        return result;
    }

    /**
     * A virtual method with the intension of being overriden in derived classes.
     * 
     * Invoking `super.onGameWon` __is not__ required.
     * 
     * This is invoked if this player wins a game
     */
    public onGameWon() {
    }

    /**
     * A virtual method with the intension of being overriden in derived classes.
     * 
     * Invoking `super.onGameLost` __is not__ required.
     * 
     * This is invoked if this player loses a game
     */
    public onGameLost() {
    }

    private cleanup() {
        this._game = null;
    }

    private setGame(game: WarGame) {
        this._game = game;
    }
}