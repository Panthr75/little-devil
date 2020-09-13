
export enum PlayingCardType {
    DIAMOND = 1,
    HEART = 2,
    SPADE = 3,
    CLUB = 4
}

export enum PlayingCardValue {
    ACE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
    SIX = 6,
    SEVEN = 7,
    EIGHT = 8,
    NINE = 9,
    TEN = 10,
    JACK = 11,
    QUEEN = 12,
    KING = 13
}

export default class PlayingCard {
    
    public readonly type: PlayingCardType;
    public readonly value: PlayingCardValue;

    public constructor(type: PlayingCardType, value: PlayingCardValue) {
        this.type = type;
        this.value = value;
    }
}