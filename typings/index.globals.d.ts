declare module NodeJS {
    export interface Global {
        /** The little devil firestore */
        fireStore: import("../src/firebase/index").default,
        /** The config */
        config: import("../src/config").Config,
        /** The bot client : may be undefined if bot not started */
        client: import("../src/bot/discord-wrappers/LittleDevilClient").default,
        /** The changelog for little devil */
        changelog: import("../src/changelog/index").FileChangelog
    }
}