import Deck from "../Deck";
import PlayingCard from "../PlayingCard";
import WarPlayer from "./WarPlayer";
import WarPlayerTurn from "./WarPlayerTurn";

export default class WarGame {

    public players: WarPlayer[];

    /** The number of face-down cards to play in war */
    public get warCardCount(): number {
        return 2;
    }

    public constructor(...players: WarPlayer[]) {
        if (players.length === 0) {
            // empty constructor, so don't initialize fields
            this.players = [];
        }
        else {
            let playerCount = players.length;

            if (playerCount < 2) throw new TypeError("A war game may not be started with less than two players");

            this.players = players;

            let deck = Deck.NO_JOKERS_DECK.shuffle();
            let cardIndex = 0;
            while (deck.count > 0) {
                players[cardIndex % playerCount].deck.pushBottom(deck.pop()!);
                cardIndex++;
            }

            for (let index = 0; index < playerCount; index++) {
                // @ts-ignore
                players[index].setGame(this);
            }
        }
    }

    /** Does a turn of war */
    public doTurn() {
        if (this.players.length === 0) return;

        let validPlayers = this.players.filter(player => !player.lost);

        if (validPlayers.length === 1) {
            this.players.forEach(player => {
                if (player.lost) player.onGameLost();
                else player.onGameWon();

                // @ts-ignore
                player.cleanup();
            });

            // @ts-ignore
            this.players = null;
        }

        let turns = this.players.filter(player => !player.lost).map(player => player.doTurn());

        let winningTurn: WarPlayerTurn = turns[0];
        let playersInWar: WarPlayer[] = [];
        let cardsWon: PlayingCard[] = [winningTurn.card];

        for (let index = 1, length = turns.length; index < length; index++) {
            let turn = turns[index];
            cardsWon.push(turn.card);

            if (winningTurn.isWar(turn)) {
                if (playersInWar.length === 0) playersInWar.push(winningTurn.player);
                playersInWar.push(turn.player);
            }
            else if (winningTurn.isTurnBetter(turn)) {
                winningTurn = turn;
            }
        }

        let warTurns: WarPlayerTurn[][];
        let newPlayersInWar: WarPlayer[] = [];

        while (playersInWar.length > 0) {
            warTurns = playersInWar.map(player => player.doWar());

            // @ts-ignore
            winningTurn = null;

            for (let index = 0, length = warTurns.length; index < length; index++) {
                let turn = warTurns[index];

                for (let turnIndex = 0, turnCount = turn.length; turnIndex < turnCount; turnIndex++) {
                    cardsWon.push(turn[turnIndex].card);
                }

                if (turn.length !== this.warCardCount + 1) {
                    continue;
                }

                let actualTurn = turn[turn.length - 1];

                if (winningTurn === null) {
                    winningTurn = actualTurn;
                }
                else if (winningTurn.isWar(actualTurn)) {
                    if (playersInWar.length === 0) newPlayersInWar.push(winningTurn.player);
                    newPlayersInWar.push(actualTurn.player);
                }
                else if (winningTurn.isTurnBetter(actualTurn)) {
                    winningTurn = actualTurn;
                }
            }

            playersInWar = newPlayersInWar;
        }

        winningTurn.giveWinningCards(cardsWon);

        this.onTurn(turns, winningTurn.player);
    }

    /**
     * The virtual method that allows listening for when a turn occurs
     * @param turns The turn for the players
     * @param playerThatWon The player that won
     */
    public onTurn(turns: WarPlayerTurn[], playerThatWon: WarPlayer) {
        //
    }
}