import express, { Router } from "express";
import Model, { RenderOptions, RenderOptionsUser } from "./Model";
import SessionsDatabase, { Session } from "../../firebase/sessions";
import config from "../../config";

/**
 * The Home Model
 */
export default class HomeModel extends Model {

    protected readonly router: Router;
    protected readonly views: string;

    protected getIndexRenderOptions(user?: RenderOptionsUser): RenderOptions {
        return {
            "path": this.getViewPath("index.ejs"),
            "title": "Little Devil | Home",
            "user": user
        };
    }

    /**
     * Instantiates a new home model
     * @param viewsPath The full path to the views folder
     * @param app The express app
     */
    public constructor(viewsPath: string, app: express.Express, sessionDB: SessionsDatabase)
    {
        super("home", app, sessionDB);
        this.views = viewsPath;

        let router = express.Router();
        this.router = router;

        router.get("/", (req, res) => {
            let cookies = req.cookies;
            let session: Session | undefined;
            if (cookies !== undefined) session = sessionDB.getSession(cookies.session);

            let user: RenderOptionsUser | undefined = session === undefined ? undefined : {
                avatarURL: session.user.user.avatarURL()!,
                username: session.user.username!,
                userID: session.user.id
            };

            res.render("template.ejs", this.getIndexRenderOptions(user));
        });

        router.get("/login", (req, res) => {
            this.logger.debug("Received request to log in");

            let cookies = req.query.cookies as any;
            let session = cookies === undefined ? undefined : cookies.session;
            if (session === undefined || sessionDB.getSession(session) === undefined) {
                this.logger.debug("Redirecting user to discord oauth page");
                res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${config.bot.client_id}&redirect_uri=${config.server.redirectURI}&response_type=code&scope=${encodeURIComponent(config.server.scopes)}`);
            }
            else {
                this.logger.debug("Redirecting user to home page, as user is already logged in");
                res.redirect("../");
            }
        });

        this.init();
    }
}