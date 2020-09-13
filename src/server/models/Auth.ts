import Model from "./Model";
import express, { Router } from "express";
import SessionsDatabase, { Session } from "../../firebase/sessions";

export default class AuthModel extends Model {

    protected readonly router: Router;
    protected readonly views: string;

    /**
     * Instantiates a new auth model
     * @param viewsPath The full path to the views folder
     * @param app The express app
     */
    public constructor(viewsPath: string, app: express.Express, sessionDB: SessionsDatabase)
    {
        super("auth", app, sessionDB);
        this.views = viewsPath;

        let router = express.Router();
        this.router = router;

        router.get("/", async (req, res) => {
            let code = req.query.code;
            if (code === undefined) { 
                res.redirect("../");
                return;
            }

            let session: Session;

            try {
                session = await this.sessionDB.completeOAuthFlow(code as string);
            }
            catch(error) {
                this.logger.error(`Caught error: ${error}`);
                res.redirect("../?failed");
                return;
            }

            res.cookie("session", sessionDB.getSessionID(session), {
                expires: session.expiresAt,
                maxAge: session.expires - Date.now()
            }).redirect("../");
        });

        this.init();
    }
}