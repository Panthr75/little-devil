import express, { Router } from "express";
import Model, { RenderOptionsUser, RenderOptions, DashboardGuildItem, DashboardRenderOptions, DashboardGuildRenderOptions } from "./Model";
import SessionsDatabase, { Session } from "../../firebase/sessions";
import config from "../../config";
import fetch from "node-fetch";
import { Permissions, Constants, Client, Guild } from "discord.js";
import { GuildData } from "../../firebase";

export default class DashboardModel extends Model {
    protected readonly router: Router;
    protected readonly views: string;
    
    private readonly _partneredGuilds: string[] = [];
    private readonly _premiumGuilds: string[] = ["683455056002941079"];
    private readonly _supportServer: string = "483416064361889802";

    protected getIndexRenderOptions(guilds: DashboardGuildItem[], user: RenderOptionsUser): DashboardRenderOptions {
        return {
            "path": this.getViewPath("index.ejs"),
            "title": "Little Devil | Dashboard",
            "user": user,
            "guilds": guilds
        };
    }

    protected getGuildRenderOptions(guildData: GuildData, guild: DashboardGuildItem, user: RenderOptionsUser, rawData: any): DashboardGuildRenderOptions {
        return {
            "path": this.getViewPath("guild.ejs"),
            "title": "Little Devil | " + guild.name,
            "user": user,
            "guild": Object.assign({ data: guildData, rawData }, guild)
        };
    }

    /**
     * Instantiates a new home model
     * @param viewsPath The full path to the views folder
     * @param app The express app
     */
    public constructor(viewsPath: string, app: express.Express, sessionDB: SessionsDatabase)
    {
        super("dashboard", app, sessionDB);
        this.views = viewsPath;

        let router = express.Router();
        this.router = router;

        router.get("/", async (req, res) => {
            let cookies = req.cookies;
            let session: Session | undefined;
            if (cookies !== undefined) session = sessionDB.getSession(cookies.session);

            let user: RenderOptionsUser | undefined = session === undefined ? undefined : {
                avatarURL: session.user.user.avatarURL()!,
                username: session.user.username!,
                userID: session.user.id
            };

            if (user === undefined) {
                res.redirect(`../login?redirect=${encodeURIComponent("dashboard")}`);
                return;
            }

            let response = await fetch(`https://discord.com/api/v6/users/@me/guilds`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session!.accessToken}`
                }
            });

            let guilds: any[] = await response.json() as any[];
            let client = global.client;
            let options = client === undefined ? Constants.DefaultOptions : client.options;
            let cdn = Constants.Endpoints.CDN(options.http!.cdn!);
            let userGuilds: DashboardGuildItem[] = guilds.map((guild) => {
                let result: DashboardGuildItem = {
                    managable: new Permissions(guild.permissions).has("MANAGE_GUILD"),
                    // @ts-ignore
                    image: guild.icon == null ? undefined : cdn.Icon(guild.id, guild.icon, "png", 64, true),
                    name: guild.name,
                    id: guild.id,
                    type: guild.id === this._supportServer ? "support-server" :
                        (client === undefined ? true : !client.guilds.cache.has(guild.id)) ? "not-joined" :        
                            this._partneredGuilds.includes(guild.id) ? "partnered" :
                                this._premiumGuilds.includes(guild.id) ? "premium" :
                                "normal"
                };
                // @ts-ignore
                result.toString = function() { return this.name }
                return result;
            }).sort();

            this.logger.debug(`Fetched '${userGuilds.length}' guild${(userGuilds.length !== 1 ? "s" : "")} (${userGuilds.filter((g) => g.managable).length} managable) from user id ${user.userID}`);

            res.render("template.ejs", this.getIndexRenderOptions(userGuilds, user));
        });

        router.get("/:id", async (req, res) => {
            let cookies = req.cookies;
            let session: Session | undefined;
            if (cookies !== undefined) session = sessionDB.getSession(cookies.session);

            let user: RenderOptionsUser | undefined = session === undefined ? undefined : {
                avatarURL: session.user.user.avatarURL()!,
                username: session.user.username!,
                userID: session.user.id
            };

            let id = req.params.id;

            if (user === undefined) {
                res.redirect(`../login?redirect=${encodeURIComponent("dashboard")}`);
                return;
            }

            let g: any;

            try {
                let response = await fetch(`https://discord.com/api/v6/users/guild/${id}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${session!.accessToken}`
                    }
                });

                g = await response.json();
            }
            catch (ex) {
                this.logger.error(ex);
                res.redirect("../");
                return;
            }

            let client = global.client;
            let options = client === undefined ? Constants.DefaultOptions : client.options;
            let cdn = Constants.Endpoints.CDN(options.http!.cdn!);

            let guild: Guild | undefined;
            if (client !== undefined) {
                guild = client.guilds.cache.get(id);
                if (guild === undefined) {
                    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${global.config.bot.client_id}&scope=bot&permissions=8&guild_id=${id}&disable_guild_select=true&redirect_uri=http%3A%2F%2F127.0.0.1%3A8888%2Fdashboard%2Fjoin`);
                    return;
                }
            }
            else {
                guild = new Guild(new Client(), g);
            }

            let guildItem: DashboardGuildItem = {
                managable: new Permissions(g.permissions).has("MANAGE_GUILD"),
                // @ts-ignore
                image: guild.icon == null ? undefined : cdn.Icon(guild.id, guild.icon, "png", 64, true),
                name: guild.name,
                id: guild.id,
                type: guild.id === this._supportServer ? "support-server" :
                    (client === undefined ? true : !client.guilds.cache.has(guild.id)) ? "not-joined" :        
                        this._partneredGuilds.includes(guild.id) ? "partnered" :
                            this._premiumGuilds.includes(guild.id) ? "premium" :
                            "normal"
            }

            let guildData: GuildData = global.fireStore.guildData[guild.id];
            if (guildData === undefined) guildData = global.fireStore.defaultGuildData();

            res.render("template.ejs", this.getGuildRenderOptions(guildData, guildItem, user, g));
        });

        this.init();
    }
}