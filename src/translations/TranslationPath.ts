

export default interface TranslationPath {

    /**
     * Resolves a dot seperated path to values
     * @param path The dot seperated path to resolve
     * @param args Any args for the specific path
     * @throws whenever the given path could not be resolved
     */
    resolve(path: string, ...args: any[]): string;
}