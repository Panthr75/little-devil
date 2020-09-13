import express, { Router } from "express";
import path from "path";
import Logger from "../../logger";
import SessionsDatabase from "../../firebase/sessions";
import { GuildData } from "../../firebase";

export type DefaultRenderOptions = {
    /** The full path of the view */
    path: string,

    /** The Title of the page */
    title: string,

    /** The user that is logged in, or undefined */
    user: undefined | RenderOptionsUser,
};

export type DashboardRenderOptions = {
    /** The full path of the view */
    path: string,

    /** The Title of the page */
    title: string,

    /** The user that is logged in */
    user: RenderOptionsUser,

    /** The guilds to render for the dashboard */
    guilds: DashboardGuildItem[]
}

export type DashboardGuildRenderOptions = {
    /** The full path of the view */
    path: string,

    /** The Title of the page */
    title: string,

    /** The user that is logged in */
    user: RenderOptionsUser,

    /** The dashboard guild selected */
    guild: DashboardGuild
}

/** The options for rendering a page */
export type RenderOptions = DefaultRenderOptions | DashboardRenderOptions | DashboardGuildRenderOptions;

export type RenderOptionsUser = {
    avatarURL: string,
    username: string,
    userID: string
};

export type DashboardGuildItem = {
    image: undefined | string,
    name: string,
    id: string,
    managable: boolean,
    type: "normal" | "not-joined" | "premium" | "partnered" | "support-server"
}

export type DashboardGuild = DashboardGuildItem & { data: GuildData, rawData: any };

/** The base class for models */
export default abstract class Model {

    /** The ID of the model */
    protected readonly id: string;

    /** The express app that instantiated this */
    protected readonly app: express.Express;

    /** The logger for this model */
    protected readonly logger: Logger;

    protected readonly sessionDB: SessionsDatabase;

    /** Gets the path in the views folder this model uses */
    protected get path(): string {
        return path.join(this.views, this.id);
    }

    /** The router for this model */
    protected abstract get router(): Router;

    /** The views path */
    protected abstract get views(): string;

    /**
     * Instantiates a new model
     * @param id The ID of the model
     * @param app The express app
     */
    public constructor(id: string, app: express.Express, sessionDB: SessionsDatabase)
    {
        this.sessionDB = sessionDB;
        this.id = id;
        this.app = app;
        this.logger = new Logger(`SERVER~${id.toUpperCase()}-VIEW`, true, true, "none");
    }

    /**
     * Inits the model, adding it to the express app
     */
    protected init(): void {
        let id = "/" + (this.id === "home" ? "" : this.id);
        this.app.use(id, this.router);
        this.logger.debug(`Initialized server router '${id}'`);
    }

    /**
     * Gets the view path for the given file
     * @param file The file to get the view path of
     */
    protected getViewPath(file: string): string {
        return path.join(this.path, file);
    }
}