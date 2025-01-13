import { TDiffOutputFileConf } from '@app-types';

class DiffOutputFile {
    public file: string;
    public fileName: string;
    public index: string;
    public aFile: string;
    public bFile: string;
    public hunks: string[];
    public acceptedHunks: string[];
    public ignoredHunks: string[];

    /**
     * Constructor for DiffOutputFile.
     *
     * @param {TDiffOutputFileConf} conf - Configuration object for the DiffOutputFile.
     *
     * The configuration object should contain the following properties:
     * - file: The file path of the file.
     * - fileName: The name of the file.
     * - index: The index of the file.
     * - aFile: The "a/" file name.
     * - bFile: The "b/" file name.
     * - hunks: An array of hunk strings.
     */
    constructor(conf: TDiffOutputFileConf) {
        this.file = conf.file;
        this.fileName = conf.fileName;
        this.index = conf.index;
        this.aFile = conf.aFile;
        this.bFile = conf.bFile;
        this.hunks = conf.hunks;
        this.acceptedHunks = [];
        this.ignoredHunks = [];
    }

    /**
     * Generates a diff patch string for the file, containing all hunks.
     *
     * @returns {string} A string representing the diff patch for the file.
     */
    public getTotalDiffPatch(): string {
        let patch = `diff --git ${this.file}`;
        patch += `\n${this.index}`;
        patch += `\n${this.aFile}`;
        patch += `\n${this.bFile}`;
        patch += `\n${this.hunks.join('\n')}`;
        if (!patch.endsWith('\n')) patch += '\n';
        return patch;
    }

    /**
     * Generates a diff patch string for the accepted hunks of a file.
     *
     * @returns {string | null} A string representing the diff patch for the accepted hunks
     * of the file, or null if there are no accepted hunks.
     */
    public getAcceptedDiffPatch(): string | null {
        if (this.acceptedHunks.length === 0) return null;
        let patch = `diff --git ${this.file}`;
        patch += `\n${this.index}`;
        patch += `\n${this.aFile}`;
        patch += `\n${this.bFile}`;
        patch += `\n${this.acceptedHunks.join('\n')}`;
        if (!patch.endsWith('\n')) patch += '\n';
        return patch;
    }

    /**
     * Generates a diff patch string for the ignored hunks of a file.
     *
     * @returns {string | null} A string representing the diff patch for the ignored hunks
     * of the file, or null if there are no ignored hunks.
     */
    public getIgnoredDiffPatch(): string | null {
        if (this.ignoredHunks.length === 0) return null;
        let patch = `diff --git ${this.file}`;
        patch += `\n${this.index}`;
        patch += `\n${this.aFile}`;
        patch += `\n${this.bFile}`;
        patch += `\n${this.ignoredHunks.join('\n')}`;
        if (!patch.endsWith('\n')) patch += '\n';
        return patch;
    }
}

export { DiffOutputFile };
