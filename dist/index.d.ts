import * as fs from 'fs';

declare class AppError extends Error {
    readonly errorTracks: string[];
    static readonly VERSION: any;
    static readonly NAME: any;
    static readonly VERSION_NAME: string;
    readonly exitCode: number;
    constructor(message: string, exitCode?: number);
    get errorTrack(): string;
    get lastTrack(): string;
    get VERSION(): any;
    get NAME(): any;
    get VERSION_NAME(): string;
}
declare class GitServiceError extends AppError {
    readonly command: string;
    constructor(message: string, command: string);
}
declare class ExternalServiceError extends AppError {
    readonly service: string;
    constructor(message: string, service: string);
}
declare class ErrorHandler {
    private static _subscriber;
    static subscribe(subscriber: (error: AppError) => void): () => void;
    static unsubscribe(subscriber: (error: AppError) => void): void;
    static throw(error: AppError): void;
}

declare const TMP_DIR: string;
declare const TMP_PATCH_DIR: string;
declare const NAME: any;
declare const VERSION: any;
declare const VERSION_NAME: string;
declare const IS_DEV: boolean;
declare const IS_TEST: boolean;
declare const LOG_SPLITTER = "_$ \u00F2 $_";
declare const COMMIT_STANDARD_TYPES: readonly [{
    readonly icon: "🚀";
    readonly name: "feat";
    readonly description: "Agregar una nueva funcionalidad o característica al proyecto.";
}, {
    readonly icon: "🐛";
    readonly name: "fix";
    readonly value: "fix";
    readonly description: "Corregir un error o bug en el código.";
}, {
    readonly icon: "📚";
    readonly name: "docs";
    readonly description: "Actualizar o modificar la documentación del proyecto (README, comentarios, etc.).";
}, {
    readonly icon: "🎨";
    readonly name: "style";
    readonly description: "Cambios en el formato o estilo del código, sin afectar la funcionalidad.";
}, {
    readonly icon: "♻️ ";
    readonly name: "refactor";
    readonly description: "Reestructuración del código para mejorar su calidad o rendimiento, sin cambiar su comportamiento.";
}, {
    readonly icon: "⚡";
    readonly name: "performance";
    readonly description: "Mejoras en el rendimiento del proyecto sin afectar su funcionalidad.";
}, {
    readonly icon: "🧪";
    readonly name: "test";
    readonly description: "Añadir o modificar pruebas (unitarias, de integración) para mejorar la cobertura del código.";
}, {
    readonly icon: "🧹";
    readonly name: "chore";
    readonly description: "Tareas de mantenimiento, configuración o administración, que no afectan la funcionalidad del proyecto.";
}, {
    readonly icon: "🏗️ ";
    readonly name: "build";
    readonly description: "Cambios relacionados con la construcción del proyecto, como dependencias, compilación o configuración.";
}, {
    readonly icon: "⚙️ ";
    readonly name: "ci";
    readonly description: "Cambios en la configuración de integración continua o en los pipelines de CI/CD.";
}, {
    readonly icon: "🚀";
    readonly name: "release";
    readonly description: "Realizar un lanzamiento o actualización de la versión del proyecto.";
}, {
    readonly icon: "❌";
    readonly name: "removed";
    readonly description: "Eliminar funcionalidades obsoletas o innecesarias.";
}, {
    readonly icon: "📉";
    readonly name: "deprecated";
    readonly description: "Marcar funcionalidades como obsoletas y que serán eliminadas en el futuro.";
}, {
    readonly icon: "🔒";
    readonly name: "security";
    readonly description: "Cambios relacionados con la seguridad, como actualizaciones para mitigar vulnerabilidades.";
}, {
    readonly icon: "⏪";
    readonly name: "revert";
    readonly value: "revert";
    readonly description: "Deshacer cambios realizados en un commit anterior.";
}, {
    readonly icon: "⚒️ ";
    readonly name: "wip";
    readonly description: "Trabajo en progreso, commit incompleto que refleja cambios aún en desarrollo.";
}];

type CacheFile = {
    cacheFilePath: string;
    content: string;
};
type FileChanges = {
    hash: string;
    originalState: CacheFile;
    acceptedChanges: CacheFile;
    ignoredChanges?: CacheFile;
};
declare class CacheStore {
    private static instance;
    private files;
    constructor();
    createPatchCache(file: {
        originalDiff: string;
        acceptedDiff: string;
        ignoredDiff?: string;
        filePath: string;
    }): string;
    getFileCache(hash: string): FileChanges;
    clearFileCache(hash: string): false | undefined;
}

type TFileListStatus = {
    added: string[];
    modified: string[];
    deleted: string[];
};
type TGitDiffOutputFileConf = {
    file: string;
    fileName: string;
    index: string;
    aFile: string;
    bFile: string;
    hunks: string[];
};
/**
 * Options for the git diff command.
 */
interface GitDiffOptions {
    /**
     * The first branch to compare.
     */
    branch1?: string;
    /**
     * The second branch to compare.
     */
    branch2?: string;
    /**
     * The file to compare.
     */
    file?: string;
    /**
     * The first commit to compare.
     */
    commit1?: string;
    /**
     * The second commit to compare.
     */
    commit2?: string;
    /**
     * Ignore all whitespace when comparing.
     */
    ignoreAllSpace?: boolean;
    /**
     * Ignore blank lines when comparing.
     */
    ignoreBlankLines?: boolean;
    /**
     * Ignore whitespace at the end of lines when comparing.
     */
    ignoreSpaceAtEol?: boolean;
    /**
     * Use the minimal diff algorithm.
     */
    minimal?: boolean;
    /**
     * Use the patience diff algorithm.
     */
    patience?: boolean;
    /**
     * Show a histogram of the differences.
     */
    histogram?: boolean;
    /**
     * Show the output in raw format.
     */
    raw?: boolean;
    /**
     * Show the output in patch format.
     */
    patch?: boolean;
    /**
     * Show the output in stat format.
     */
    stat?: boolean;
    /**
     * Show the output in numstat format.
     */
    numstat?: boolean;
    /**
     * Show the output in shortstat format.
     */
    shortstat?: boolean;
    /**
     * Ignore changes in whitespace between lines.
     */
    ignoreSpaceChanges?: boolean;
    /**
     * Ignore whitespace when comparing.
     */
    ignoreSpace?: boolean;
    /**
     * Ignore whitespace at the end of lines when comparing.
     */
    ignoreTrailingSpace?: boolean;
    /**
     * Ignore changes in whitespace between lines.
     */
    ignoreSpaceChangesBetweenLines?: boolean;
}
type GitLogCommitInfo = {
    hash: string;
    author: {
        name: string;
        email: string;
    };
    date: string;
    title: string;
    body: string;
};

type ChangelogSections = {
    added: GitLogCommitInfo[];
    fixed: GitLogCommitInfo[];
    documentation: GitLogCommitInfo[];
    changed: GitLogCommitInfo[];
    removed: GitLogCommitInfo[];
    deprecated: GitLogCommitInfo[];
    security: GitLogCommitInfo[];
};
declare class ChangeLogService {
    /**
     * Groups a list of commit objects into sections based on their titles.
     *
     * The sections are:
     *
     * - added: commits with titles starting with 'feat'
     * - fixed: commits with titles starting with 'fix'
     * - documentation: commits with titles starting with 'docs'
     * - changed: commits with titles starting with 'style', 'refactor', 'perf', 'test', 'chore', 'build', or 'ci'
     * - removed: commits with titles starting with 'removed'
     * - deprecated: commits with titles starting with 'deprecated'
     * - security: commits with titles starting with 'security'
     *
     * @param {GitLogCommitInfo[]} commits - An array of commit objects
     * @returns {ChangelogSections}
     */
    static groupCommitSections(commits: GitLogCommitInfo[]): ChangelogSections;
    /**
     * Generates a changelog file based on a list of commit objects.
     *
     * @param {object} data - An object containing the commits, version, and optional output file name.
     * @param {GitLogCommitInfo[]} data.commits - An array of commit objects.
     * @param {string} data.version - The version number to include in the changelog.
     * @param {string} [data.outputFile='changelog.md'] - The file name to save the changelog to.
     */
    static generateChangelog(data: {
        commits: GitLogCommitInfo[];
        outputFile?: string;
        version: string;
    }): void;
    private static _writeSection;
}

declare class FileServiceError extends Error {
    readonly file: string;
    readonly action: 'read' | 'write' | 'delete';
    constructor(message: string, file: string, action: 'read' | 'write' | 'delete');
}
/**
 * Generates a SHA1 hash for the given content.
 * @param {string} [content] - The content to hash. If not provided, an empty hash is returned.
 * @returns {string} The SHA1 hash of the content.
 */
declare const sha1: (content?: string) => string;
/**
 * Reads the content of a file at the given path.
 * @param {string} path - The path to the file to be read.
 * @returns {string} The content of the file as a UTF-8 encoded string.
 * @throws {FileServiceError} If an error occurs while reading the file.
 */
declare const rf: (path: string) => string;
/**
 * Writes data to a file at the given path.
 * @param {string} path - The path to the file where data should be written.
 * @param {string} data - The data to be written to the file.
 * @throws {FileServiceError} If an error occurs while writing to the file.
 */
declare const wf: (path: string, data: string) => void;
/**
 * Creates a SHA1 hash of a given file.
 * @param {string} filePath - The content of the file to hash.
 * @returns {string} The SHA1 hash of the given file.
 */
declare const createFileHash: (filePath: string) => string;
/**
 * Resolves a given path relative to the current working directory.
 *
 * @param {string} path - The path to be resolved.
 * @param {string} cwd - The current working directory.
 * @returns {string} The resolved absolute path.
 */
declare const resolvePath: (path: string, cwd?: string) => string;
/**
 * Checks if a file or directory exists at the specified path.
 *
 * @param {string} path - The path to check for existence.
 * @returns {boolean} True if the path exists, false otherwise.
 */
declare const existsPath: (path: string) => boolean;
/**
 * Creates the directory path if it does not exist.
 *
 * @param {string} path - The path to the directory to be created.
 * @returns {void}
 */
declare const createDirPath: (path: string) => void;
/**
 * Moves a file from the origin path to the destination path.
 * @param {string} originPath - The path to the file to be moved.
 * @param {string} destinationPath - The path where the file should be moved to.
 * @param {string} [cwd=process.cwd()] - The current working directory. Defaults to the process's cwd.
 * @throws {FileServiceError} If the file does not exist at the given path.
 */
declare const mf: (originPath: string, destinationPath: string, cwd?: string) => void;
/**
 * Gets the stats of a file at the given path.
 *
 * @param {string} path - The path to the file to get the stats from.
 * @returns {import("fs").Stats} The stats of the file.
 * @throws {FileServiceError} If the file does not exist at the given path.
 */
declare const getFileStat: (path: string) => fs.Stats;
/**
 * Checks if the given path is a file.
 * @param {string} path - The path to check.
 * @returns {boolean} True if the path is a file, false otherwise.
 */
declare const isFile: (path: string) => boolean;
/**
 * Checks if the given path is a directory.
 * @param {string} path - The path to check.
 * @returns {boolean} True if the path is a directory, false otherwise.
 */
declare const isDirectory: (path: string) => boolean;

declare class GitDiffService {
    /**
     * Execute the git diff command with the provided options.
     * @param options Options for the git diff command.
     * @returns The output of the git diff command.
     */
    static diff(options: GitDiffOptions): Promise<string>;
    /**
     * Build the git diff command based on the provided options.
     * @param options Options for the git diff command.
     * @returns The built git diff command.
     */
    private static buildDiffCommand;
    /**
     * Parses the output of a git diff command and extracts information about the files and their hunks.
     *
     * @param options Options for the git diff command.
     * @returns An array of GitDiffOutputFile objects, each containing details about a file and its hunks.
     *
     * The function splits the diff output into rows and iterates through them. It creates a new GitDiffOutputFile
     * object for each file detected in the diff output, collecting its hunks. Hunks are added to the current file
     * object until a new file is encountered.
     */
    static parseGitDiffOutput(options: GitDiffOptions): Promise<GitDiffOutputFile[]>;
}
declare class GitDiffOutputFile {
    file: string;
    fileName: string;
    index: string;
    aFile: string;
    bFile: string;
    hunks: string[];
    acceptedHunks: string[];
    ignoredHunks: string[];
    constructor(conf: TGitDiffOutputFileConf);
    getTotalDiffPatch(): string;
    getAcceptedDiffPatch(): string | null;
    getIgnoredDiffPatch(): string | null;
}

declare class GitServiceFilesReport {
    readonly staged: TFileListStatus;
    readonly unstaged: TFileListStatus;
    readonly untracked: string[];
    constructor({ staged, unstaged, untracked }: {
        staged: TFileListStatus;
        unstaged: TFileListStatus;
        untracked: string[];
    });
    protected _fileListStatus(list: TFileListStatus): string;
    stagedReport(): string;
    unstagedReport(): string;
    untrackedReport(): string;
    totalReport(): string;
}

declare class GitService {
    /**
     * Get the user configuration from Git.
     *
     * @returns A promise that resolves with an object containing the user name and email.
     * @throws {GitServiceError} If the command fails.
     */
    static getUser(): Promise<{
        name: string;
        email: string;
        toString: () => string;
    }>;
    static setUser(name: string, email: string): Promise<void>;
    /**
     * Get a list of staged files from Git.
     *
     * @returns A promise that resolves with an object containing three properties: added, modified and deleted.
     * Each property is an array of strings, containing the names of the files that have been added, modified or
     * deleted, respectively.
     * @throws {ExternalServiceError} If the command fails.
     */
    static listStagedFiles: () => Promise<TFileListStatus>;
    /**
     * Get a list of unstaged files from Git.
     *
     * @returns A promise that resolves with an object containing three properties: added, modified, and deleted.
     * Each property is an array of strings, containing the names of the files that have been added, modified, or
     * deleted, respectively.
     * @throws {ExternalServiceError} If the command fails.
     */
    static listUnstagedFiles(): Promise<TFileListStatus>;
    /**
     * Get a list of untracked files from Git.
     *
     * @returns A promise that resolves with an array of strings, containing the names of the files that are not
     * tracked by Git.
     * @throws {ExternalServiceError} If the command fails.
     */
    static listUntrackedFiles(): Promise<string[]>;
    /**
     * Get a report of the files in the Git repository, including staged, unstaged, and untracked files.
     *
     * @returns A promise that resolves with an object containing the file lists.
     * @throws {ExternalServiceError} If the command fails.
     */
    static filesReport(): Promise<GitServiceFilesReport>;
    static log(args?: {
        from?: string;
        to?: string;
        branch?: string;
    }): Promise<GitLogCommitInfo[]>;
}

declare class GitServiceTagger {
    static createAnnotatedTag({ message, name }: {
        name: string;
        message?: string;
    }): Promise<string>;
    static createLightweightTag(name: string): Promise<string>;
    static deleteTag(name: string): Promise<string>;
    static pushTag(name: string): Promise<string>;
    static deleteRemoteTag(name: string, remote?: string): Promise<string>;
    static listTagsLocal(): Promise<string | undefined>;
    static listTagsNamesLocal(): Promise<string[]>;
    static listTagsRemote(): Promise<string | undefined>;
}

declare class MarkdownService {
    private _content;
    constructor();
    /**
     * Adds a title to the markdown content.
     * @param {string} text The text of the title.
     * @param {number} [level=1] The level of the title, from 1 to 6.
     * @returns {this} The markdown service to chain methods.
     */
    addTitle(text: string, level?: number): this;
    /**
     * Adds a paragraph to the markdown content.
     * @param {string} text The text of the paragraph.
     * @returns {this} The markdown service to chain methods.
     */
    addParagraph(text: string): this;
    /**
     * Adds a specified number of end lines to the markdown content.
     * @param {number} [ammount=1] The number of end lines to add.
     * @returns {this} The markdown service to chain methods.
     */
    addEndLine(ammount?: number): this;
    /**
     * Add an unordered list to the markdown content.
     * @param {string[]} items The items to include in the unordered list.
     * @returns {this} The markdown service to chain methods.
     */
    addUnorderedList(items: string[]): this;
    /**
     * Add an ordered list to the markdown content.
     * @param {string[]} items The items to include in the ordered list.
     * @returns {this} The markdown service to chain methods.
     */
    addOrderedList(items: string[]): this;
    /**
     * Add a link to the markdown content.
     * @param {string} text The text of the link.
     * @param {string} url The URL of the link.
     * @returns {this} The markdown service to chain methods.
     */
    addLink(text: string, url: string): this;
    /**
     * Add a code block to the markdown content.
     * @param {string} code The code to add.
     * @param {string} [language='typescript'] The language of the code block.
     * @returns {this} The markdown service to chain methods.
     */
    addCodeBlock(code: string, language?: string): this;
    /**
     * Getter for the markdown content.
     * @returns {string} The markdown content.
     */
    get contentMarkdown(): string;
    /**
     * Resets the markdown content to an empty string.
     * @returns {this} The markdown service to chain methods.
     */
    clear(): this;
    /**
     * Outputs the current markdown content to a file.
     * @param {string} path - The path to the file where the markdown content should be written.
     * @returns {this} The markdown service to chain methods.
     * @throws {FileServiceError} If an error occurs while writing to the file.
     */
    outputToFile(path: string): this;
    /**
     * Adds a string of plain text to the markdown content. (NO ENDLINE)
     * @param {string} text The text to add.
     * @returns {this} The markdown service to chain methods.
     */
    addText(text: string): this;
}

/**
 * Execute a command in the shell and return the result as a promise.
 *
 * @param command The command to execute.
 * @returns A promise that resolves with the result of the command execution.
 * @throws {GitServiceError} If the command fails.
 */
declare const exeCommand: (command: string, onError?: (even: GitServiceError) => void | Promise<void>) => Promise<string>;
/**
 * Parse a string containing a list of tags with their commit hashes and
 * return a string with each tag in a separate line, indented by two spaces.
 * Each line is formatted as " * <tag> <commit>" and the tags are padded to
 * 15 characters.
 * @param data The string to parse.
 * @returns A string with the parsed list of tags.
 */
declare const parseTagsList: (data: string) => string;
/**
 * Process a string containing a list of files with their status (from Git)
 * and return an object with three properties: added, modified and deleted.
 * Each property is an array of strings, containing the names of the files
 * that have been added, modified or deleted.
 *
 * @param data The string to process.
 * @returns An object with three properties: added, modified and deleted.
 */
declare const processFiles: (data: string) => TFileListStatus;

export { AppError, COMMIT_STANDARD_TYPES, type CacheFile, CacheStore, ChangeLogService, ErrorHandler, ExternalServiceError, type FileChanges, FileServiceError, type GitDiffOptions, GitDiffOutputFile, GitDiffService, type GitLogCommitInfo, GitService, GitServiceError, GitServiceFilesReport, GitServiceTagger, IS_DEV, IS_TEST, LOG_SPLITTER, MarkdownService, NAME, type TFileListStatus, type TGitDiffOutputFileConf, TMP_DIR, TMP_PATCH_DIR, VERSION, VERSION_NAME, createDirPath, createFileHash, exeCommand, existsPath, getFileStat, isDirectory, isFile, mf, parseTagsList, processFiles, resolvePath, rf, sha1, wf };
