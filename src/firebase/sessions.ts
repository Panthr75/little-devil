import { Snowflake, User, Client } from "discord.js";
import btoa from "btoa";
import config from "../config";
import fetch, { RequestInit } from "node-fetch";
import URLSearchParams from "url-search-params";
import Logger from "../logger";
import Firestore from ".";
import LittleDevilClient from "../bot/discord-wrappers/LittleDevilClient";

export type TokenResponse = {
    /** The access token */
    access_token: string,

    /** The type of token this is */
    token_type: "Bearer",
    
    /** The time after the request at which this token expires (in seconds) */
    expires_in: number,

    /** Not returned in response, is set manually */
    expires: number,

    /** The refresh token */
    refresh_token: string,

    /** The scopes used */
    scope: string
};

export class Session {

    private readonly _token: TokenResponse;
    private readonly _user: SessionUser;

    /** The access token */
    public get accessToken(): string {
        return this._token.access_token;
    }

    /** The time this session expires */
    public get expires(): number {
        return this._token.expires;
    }

    /** The time in which this token expires (in milliseconds) */
    public get expiresIn(): number {
        return this._token.expires_in;
    }

    /** The date at which this session expires */
    public get expiresAt(): Date {
        return new Date(this._token.expires);
    }

    /** Whether or not this session has expired */
    public get expired(): boolean {
        return Date.now() - this.expires >= 0;
    }

    /** The session user */
    public get user(): SessionUser {
        return this._user;
    }

    public constructor(token: TokenResponse, user: SessionUser) {
        this._token = token;
        this._user = user;
    }
}

/** A bare-bones light-weight User class */
export class SessionUser {
    
    private _user: User;
    /** An array of sessions this user has */
    private _sessions: Session[] = [];

    /** A discriminator based on username for the user */
    public get discriminator(): string | undefined {
        return this._user.discriminator;
    }

    /** The id of the user */
    public get id(): Snowflake {
        return this._user.id;
    }

    /** Attempts to get the user from the userID */
    public get user(): User {
        return this._user;
    }

    /** The username of the user */
    public get username(): string | undefined {
        return this._user.username;
    }
    
    public constructor(user: User) {
        this._user = user;
    }
}

export default class SessionsDatabase {

    private logger: Logger = new Logger("SESSION-DB", true, true, "none");

    /** The list of users */
    private _sessionUsers: Map<string, SessionUser> = new Map()

    private _users: Map<string, User> = new Map();

    /** The list of sessions */
    private _sessions: Map<string, Session> = new Map();

    private _firestore: Firestore;

    public constructor(firestore: Firestore) {
        this._firestore = firestore;
    }

    /**
     * Completes the oauth flow with the given auth code, returning with session
     * @param code The auth code
     */
    public async completeOAuthFlow(code: string, cache: boolean = false): Promise<Session> {
        let url = `https://discord.com/api/v6/oauth2/token`;

        let params = new URLSearchParams();
        params.append("cliend_id", config.bot.client_id);
        params.append("client_secret", config.bot.secret);
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("scope", config.server.scopes);
        params.append("redirect_uri", config.server.redirectURI);

        let options: RequestInit = {
            method: "POST",
            headers: {
                Authorization: `Basic ${btoa(`${config.bot.client_id}:${config.bot.secret}`)}`,
                'Content-Type': "application/x-www-form-urlencoded"
            },
            body: params
        };

        let res = await fetch(url, options);
        let token: TokenResponse = await res.json();
        token.expires_in *= 1000;
        token.expires = Date.now() + token.expires_in;

        let userRes = await fetch("https://discordapp.com/api/v6/users/@me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token.access_token}`
            }
        });

        let userObj = await userRes.json();

        let client: LittleDevilClient | undefined = global.client;
        let user: User;

        if (client === undefined) {
            // use empty client for now
            user = new User(new Client(), userObj);
        }
        else {
            // returns the existing user, or adds a new
            // user using the userObj, and returns the newly
            // created user
            user = client.users.add(userObj, cache);
        }

        this._users.set(user.id, user);
        
        let sessionUser: SessionUser | undefined = this._sessionUsers.get(user.id);
        if (sessionUser === undefined) sessionUser = new SessionUser(user);

        let session = this.createSession(token, sessionUser);
        // @ts-ignore (private property use)
        sessionUser._sessions.push(session);

        return session;
    }

    /**
     * Generates a session key for a user
     * @param length The length of the session key
     */
    public createSessionKey(length: number = 128): string {
        let keys = Array.from(this._sessions.keys());

        while (true) {
            let key = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";
            let result = "";
            for (let index = 0; index < length; index++) {
                // append a random character to the result
                result += key.charAt(Math.floor(Math.random() * key.length));
            }

            if (!keys.includes(result)) {
                this.logger.debug(`Created new key: '${result}'`);
                return result;
            }
        }
    }

    /**
     * Generates a session for the given token and user
     * @param token The token
     * @param user The user for the session
     */
    public createSession(token: TokenResponse, user: SessionUser): Session {
        let key = this.createSessionKey();
        let session = new Session(token, user);
        this._sessions.set(key, session);
        this.logger.info(`Created session.`);
        return session;
    }

    /** Updates the session list, removing any expired sessions */
    public updateSessions(): void {
        for (let [ sessionID, session ] of this._sessions) {
            if (session.expired) {
                this._sessions.delete(sessionID);
            }
        }
    }

    /**
     * Gets a session ID from a session
     * @param session The session to get the ID
     */
    public getSessionID(session: Session): string | undefined {
        for (let [sessionID, s] of this._sessions) {
            if (s === session) {
                return sessionID;
            }
        }
        return undefined;
    }

    /**
     * Gets a session from the given id
     * @param sessionID The id of the session to get
     */
    public getSession(sessionID: string): Session | undefined {
        return this._sessions.get(sessionID);
    }
}