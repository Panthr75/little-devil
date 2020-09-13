import PlayingCard, { PlayingCardType, PlayingCardValue } from "./PlayingCard";

/** The deck of playing cards. */
export default class Deck {

    private _cards: PlayingCard[] = [];

    /** Returns the number of cards in this deck */
    public get count(): number {
        return this._cards.length;
    }

    /** Shuffles the deck */
    public shuffle(): this {

        let cards = this._cards.slice();
        let newCards: PlayingCard[] = [];

        while (cards.length > 0) {
            let randomCardIndex = Math.floor(Math.random() * cards.length);
            newCards.push(cards.splice(randomCardIndex, 1)[0]);
        }

        this._cards = cards;

        return this;
    }

    /**
     * Pushes a playing card to the top of the deck
     * @param card The card to add to the top of the deck
     */
    public pushTop(card: PlayingCard): this {
        this._cards.unshift(card);

        return this;
    }

    /**
     * Pushes a playing card to the bottom of the deck
     * @param card The card to add to the bottom of the deck
     */
    public pushBottom(card: PlayingCard): this {
        this._cards.push(card);

        return this;
    }

    /**
     * Gets the top-most playing card from the deck,
     * removes it from the deck, and returns it
     */
    public pop(): PlayingCard | null {
        if (this._cards.length === 0) return null;
        return this._cards.splice(0, 1)[0];
    }

    /**
     * Combines this deck with other decks, adding the decks to the bottom of this deck
     * @param decks The decks to add to the bottom of this one
     */
    public combineBottom(...decks: Deck[]) {
        
        for (let deckIndex = 0, deckLength = decks.length; deckIndex < deckLength; deckIndex++) {
            let deck = decks[deckIndex];

            for (let cardIndex = 0, cardLength = deck._cards.length; cardIndex < cardLength; cardIndex++) {
                let card = deck._cards[cardIndex];

                this.pushBottom(card);
            }
        }
    }

    /**
     * Combines this deck with other decks, adding the decks to the top of this deck
     * @param decks The decks to add to the top of this one
     */
    public combineTop(...decks: Deck[]) {
        
        for (let deckIndex = 0, deckLength = decks.length; deckIndex < deckLength; deckIndex++) {
            let deck = decks[deckIndex];

            for (let cardIndex = 0, cardLength = deck._cards.length; cardIndex < cardLength; cardIndex++) {
                let card = deck._cards[cardIndex];

                this.pushTop(card);
            }
        }
    }

    
    /** The deck of all club cards (not including royals) */
    public static get CLUB_DECK(): Deck {
        let deck = new Deck();

        deck.pushBottom(new PlayingCard(PlayingCardType.CLUB, PlayingCardValue.ACE));
        deck.pushBottom(new PlayingCard(PlayingCardType.CLUB, PlayingCardValue.TWO));
        deck.pushBottom(new PlayingCard(PlayingCardType.CLUB, PlayingCardValue.THREE));
        deck.pushBottom(new PlayingCard(PlayingCardType.CLUB, PlayingCardValue.FOUR));
        deck.pushBottom(new PlayingCard(PlayingCardType.CLUB, PlayingCardValue.FIVE));
        deck.pushBottom(new PlayingCard(PlayingCardType.CLUB, PlayingCardValue.SIX));
        deck.pushBottom(new PlayingCard(PlayingCardType.CLUB, PlayingCardValue.SEVEN));
        deck.pushBottom(new PlayingCard(PlayingCardType.CLUB, PlayingCardValue.EIGHT));
        deck.pushBottom(new PlayingCard(PlayingCardType.CLUB, PlayingCardValue.NINE));
        deck.pushBottom(new PlayingCard(PlayingCardType.CLUB, PlayingCardValue.TEN));

        return deck;
    }
    
    /** The deck of all club cards (including royals) */
    public static get ROYAL_CLUB_DECK(): Deck {
        let deck = this.CLUB_DECK;

        deck.pushBottom(new PlayingCard(PlayingCardType.CLUB, PlayingCardValue.JACK));
        deck.pushBottom(new PlayingCard(PlayingCardType.CLUB, PlayingCardValue.QUEEN));
        deck.pushBottom(new PlayingCard(PlayingCardType.CLUB, PlayingCardValue.KING));

        return deck;
    }
    
    /** The deck of all spade cards (not including royals) */
    public static get SPADE_DECK(): Deck {
        let deck = new Deck();

        deck.pushBottom(new PlayingCard(PlayingCardType.SPADE, PlayingCardValue.ACE));
        deck.pushBottom(new PlayingCard(PlayingCardType.SPADE, PlayingCardValue.TWO));
        deck.pushBottom(new PlayingCard(PlayingCardType.SPADE, PlayingCardValue.THREE));
        deck.pushBottom(new PlayingCard(PlayingCardType.SPADE, PlayingCardValue.FOUR));
        deck.pushBottom(new PlayingCard(PlayingCardType.SPADE, PlayingCardValue.FIVE));
        deck.pushBottom(new PlayingCard(PlayingCardType.SPADE, PlayingCardValue.SIX));
        deck.pushBottom(new PlayingCard(PlayingCardType.SPADE, PlayingCardValue.SEVEN));
        deck.pushBottom(new PlayingCard(PlayingCardType.SPADE, PlayingCardValue.EIGHT));
        deck.pushBottom(new PlayingCard(PlayingCardType.SPADE, PlayingCardValue.NINE));
        deck.pushBottom(new PlayingCard(PlayingCardType.SPADE, PlayingCardValue.TEN));

        return deck;
    }
    
    /** The deck of all spade cards (including royals) */
    public static get ROYAL_SPADE_DECK(): Deck {
        let deck = this.SPADE_DECK;

        deck.pushBottom(new PlayingCard(PlayingCardType.SPADE, PlayingCardValue.JACK));
        deck.pushBottom(new PlayingCard(PlayingCardType.SPADE, PlayingCardValue.QUEEN));
        deck.pushBottom(new PlayingCard(PlayingCardType.SPADE, PlayingCardValue.KING));

        return deck;
    }

    /** The deck of all diamond cards (not including royals) */
    public static get DIAMOND_DECK(): Deck {
        let deck = new Deck();

        deck.pushBottom(new PlayingCard(PlayingCardType.DIAMOND, PlayingCardValue.ACE));
        deck.pushBottom(new PlayingCard(PlayingCardType.DIAMOND, PlayingCardValue.TWO));
        deck.pushBottom(new PlayingCard(PlayingCardType.DIAMOND, PlayingCardValue.THREE));
        deck.pushBottom(new PlayingCard(PlayingCardType.DIAMOND, PlayingCardValue.FOUR));
        deck.pushBottom(new PlayingCard(PlayingCardType.DIAMOND, PlayingCardValue.FIVE));
        deck.pushBottom(new PlayingCard(PlayingCardType.DIAMOND, PlayingCardValue.SIX));
        deck.pushBottom(new PlayingCard(PlayingCardType.DIAMOND, PlayingCardValue.SEVEN));
        deck.pushBottom(new PlayingCard(PlayingCardType.DIAMOND, PlayingCardValue.EIGHT));
        deck.pushBottom(new PlayingCard(PlayingCardType.DIAMOND, PlayingCardValue.NINE));
        deck.pushBottom(new PlayingCard(PlayingCardType.DIAMOND, PlayingCardValue.TEN));

        return deck;
    }

    /** The deck of all diamond cards (including royals) */
    public static get ROYAL_DIAMOND_DECK(): Deck {
        let deck = this.DIAMOND_DECK;
        
        deck.pushBottom(new PlayingCard(PlayingCardType.DIAMOND, PlayingCardValue.JACK));
        deck.pushBottom(new PlayingCard(PlayingCardType.DIAMOND, PlayingCardValue.QUEEN));
        deck.pushBottom(new PlayingCard(PlayingCardType.DIAMOND, PlayingCardValue.KING));

        return deck;
    }

    /** The deck of all heart cards (not including royals) */
    public static get HEART_DECK(): Deck {
        let deck = new Deck();

        deck.pushBottom(new PlayingCard(PlayingCardType.HEART, PlayingCardValue.ACE));
        deck.pushBottom(new PlayingCard(PlayingCardType.HEART, PlayingCardValue.TWO));
        deck.pushBottom(new PlayingCard(PlayingCardType.HEART, PlayingCardValue.THREE));
        deck.pushBottom(new PlayingCard(PlayingCardType.HEART, PlayingCardValue.FOUR));
        deck.pushBottom(new PlayingCard(PlayingCardType.HEART, PlayingCardValue.FIVE));
        deck.pushBottom(new PlayingCard(PlayingCardType.HEART, PlayingCardValue.SIX));
        deck.pushBottom(new PlayingCard(PlayingCardType.HEART, PlayingCardValue.SEVEN));
        deck.pushBottom(new PlayingCard(PlayingCardType.HEART, PlayingCardValue.EIGHT));
        deck.pushBottom(new PlayingCard(PlayingCardType.HEART, PlayingCardValue.NINE));
        deck.pushBottom(new PlayingCard(PlayingCardType.HEART, PlayingCardValue.TEN));

        return deck;
    }

    /** The deck of all heart cards (including royals) */
    public static get ROYAL_HEART_DECK(): Deck {
        let deck = this.HEART_DECK;
        
        deck.pushBottom(new PlayingCard(PlayingCardType.HEART, PlayingCardValue.JACK));
        deck.pushBottom(new PlayingCard(PlayingCardType.HEART, PlayingCardValue.QUEEN));
        deck.pushBottom(new PlayingCard(PlayingCardType.HEART, PlayingCardValue.KING));

        return deck;
    }

    /** The deck of all cards except jokers */
    public static get NO_JOKERS_DECK(): Deck {
        let deck = new Deck();

        deck.combineBottom(this.ROYAL_CLUB_DECK);
        deck.combineBottom(this.ROYAL_SPADE_DECK);
        deck.combineBottom(this.ROYAL_DIAMOND_DECK);
        deck.combineBottom(this.ROYAL_HEART_DECK);

        return deck;
    }
}