import fs from "fs";


export type RawChangelogEntry = {
    message: string,
    timestamp: number
};

export class ChangelogEntry {

    private readonly _entry: RawChangelogEntry;

    /** The date of this entry */
    public get date(): Date {
        return new Date(this.timestamp);
    }

    /** The message for this entry */
    public get message(): string {
        return this._entry.message;
    }

    /** The timestamp of this changelog entry */
    public get timestamp(): number {
        return this._entry.timestamp;
    }

    public constructor(entry: RawChangelogEntry) {
        this._entry = entry;
    }

    public toJSON(): RawChangelogEntry {
        return {
            "message": this._entry.message,
            "timestamp": this._entry.timestamp
        };
    }

    public static fromJSON(json: RawChangelogEntry) {
        return new ChangelogEntry(json);
    }
}

export type RawChangelog = {
    bot: RawChangelogEntry[],
    server: RawChangelogEntry[]
};

type ChangelogData = {
    bot: ChangelogEntry[],
    server: ChangelogEntry[]
};

export class Changelog {

    private readonly _changelog: ChangelogData;

    /** The list of bot changelog entries */
    public get bot(): ChangelogEntry[] {
        return this._changelog.bot.slice();
    }

    /** The list of server changelog entries */
    public get server(): ChangelogEntry[] {
        return this._changelog.server.slice();
    }

    public constructor(text: string) {
        let json: RawChangelog = JSON.parse(text);
        if (json.bot === undefined) throw new TypeError("Expected text to have `bot` property");
        if (json.server === undefined) throw new TypeError("Expected text to have `server` property");

        let changelog: ChangelogData = {
            "bot": json.bot.map(entry => ChangelogEntry.fromJSON(entry)),
            "server": json.server.map(entry => ChangelogEntry.fromJSON(entry))
        };

        this._changelog = changelog;
    }

    public createBotEntry(message: string): ChangelogEntry {
        let entry = ChangelogEntry.fromJSON({
            "message": message,
            "timestamp": Date.now()
        });

        this._changelog.bot.push(entry);

        this.onUpdate();

        return entry;
    }

    public createServerEntry(message: string): ChangelogEntry {
        let entry = ChangelogEntry.fromJSON({
            "message": message,
            "timestamp": Date.now()
        });

        this._changelog.server.push(entry);

        this.onUpdate();

        return entry;
    }

    /** A virtual method invoked whenever this changelog is updated */
    public onUpdate(): void {}

    public toJSON(): RawChangelog {
        return {
            "bot": this._changelog.bot.map(entry => entry.toJSON()),
            "server": this._changelog.server.map(entry => entry.toJSON())
        };
    }
}

export class FileChangelog extends Changelog {

    private readonly _filePath: string;
    private readonly _autoSave: boolean;

    public constructor(file: string, autoSave: boolean = true) {
        super(fs.readFileSync(file, { encoding: "utf8" }));
        this._filePath = file;
        this._autoSave = autoSave;
    }

    /** Saves this into the file */
    public save() {
        fs.writeFileSync(this._filePath, JSON.stringify(this.toJSON()), { "encoding": "utf8" });
    }

    public onUpdate(): void {
        if (this._autoSave) {
            this.save();
        }
    }
}