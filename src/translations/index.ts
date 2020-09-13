import English from "./English";
import Translation from "./Translation";

export default class Translations {
    
    private static readonly _en: English = new English();

    public static get en(): English {
        return this._en;
    }

    public static getWithLang(language: string, path: string, ...args: any[]): string {
        return this.getLanguage(language).resolve(path, ...args);
    }

    /**
     * Gets the translation from the given path
     * @param path The path to get. Must start with the language
     * @param args The args for getting the translation
     */
    public static get(path: string, ...args: any[]): string {
        let paths = path.split(".");
        let option = paths.splice(0, 1)[0];
        let newPath = paths.join(".");

        let translator = this.getLanguage(option);
        return translator.resolve(newPath, ...args);
    }

    public static getLanguage(id: string | undefined): Translation {
        if (id === undefined) id = "en";
        
        if (id === "en") return this.en;
        else throw new Error("Invalid id for the language to get");
    }
}