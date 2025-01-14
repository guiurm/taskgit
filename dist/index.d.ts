import { ExecException } from 'node:child_process';
import { Stats } from 'node:fs';

declare const TMP_DIR: string;
declare const TMP_PATCH_DIR: string;
declare const NAME: any;
declare const VERSION: any;
declare const VERSION_NAME: string;
declare const IS_DEV: boolean;
declare const IS_PROD: boolean;
declare const IS_TEST: boolean;
declare const LOG_SPLITTER = "_$ \u00F2 $_";

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
    /**
     * Creates a new patch cache from the given information.
     *
     * @param {object} file
     * @param {string} file.originalDiff
     * @param {string} file.acceptedDiff
     * @param {string} [file.ignoredDiff]
     * @param {string} file.filePath
     * @returns {string} The hash of the created cache
     */
    createPatchCache(file: {
        originalDiff: string;
        acceptedDiff: string;
        ignoredDiff?: string;
        filePath: string;
    }): string;
    /**
     * Returns the cache stored with the given hash.
     *
     * @param {string} hash - The hash of the cache to retrieve
     * @returns {FileChanges} The cache or undefined if it does not exist
     */
    getFileCache(hash: string): FileChanges;
    /**
     * Clears the file cache associated with the given hash.
     *
     * @param {string} hash - The hash of the cache to clear.
     * @returns {boolean} - Returns false if the cache does not exist.
     * Deletes the cached files for the original state, accepted changes,
     * and ignored changes if they exist.
     */
    clearFileCache(hash: string): boolean;
}

type TFileListStatus = {
    added: string[];
    modified: string[];
    deleted: string[];
};
type TDiffOutputFileConf = {
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
    /**
     * Writes a section in the markdown document for a given list of commits.
     *
     * @param {GitLogCommitInfo[]} commits - An array of commit objects to be included in the section.
     * @param {string} title - The title of the section to be added to the markdown document.
     * @param {MarkdownService} md - The markdown service instance used to create and modify the markdown content.
     *
     * @returns {void}
     */
    private static _writeSection;
}

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
declare class FilesReportServiceError extends AppError {
    readonly command: string;
    constructor(message: string, command: string);
}
declare class ExternalServiceError extends AppError {
    readonly service: string;
    constructor(message: string, service: string);
}
type CommandExecutionErrorConstructor = {
    message: string;
    command: string;
    error: ExecException;
    stdout: string;
    stderr: string;
};
declare class CommandExecutionError extends AppError {
    readonly command: string;
    readonly error: ExecException;
    readonly stdout: string;
    readonly stderr: string;
    constructor({ command, error, message, stderr, stdout }: CommandExecutionErrorConstructor);
}
declare class ErrorHandler {
    private static _subscriber;
    static subscribe(subscriber: (error: AppError) => void): () => void;
    static unsubscribe(subscriber: (error: AppError) => void): void;
    static throw(error: AppError): void;
}

/**
 * Executes a command and returns the result as a promise.
 *
 * @param command The command to execute. Can be a string or an array of strings.
 * @param onError A callback that will be called if the command execution fails.
 *                If the callback returns true, the method will throw an error.
 *                If it returns false or nothing, the method will return the error
 *                as a CommandExecutionError. If the callback returns a promise,
 *                the method will wait for the promise to resolve before deciding
 *                what to do.
 * @returns A promise that resolves with the output of the command as a string.
 */
declare const exeCommand: (command: string | string[], onError?: (even: CommandExecutionError) => boolean | Promise<boolean>) => Promise<string>;

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
 * @returns {import("node:fs").Stats} The stats of the file.
 * @throws {FileServiceError} If the file does not exist at the given path.
 */
declare const getFileStat: (path: string) => Stats;
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

declare class ConfigService {
    /**
     * Get the user configuration from Git.
     *
     * @returns A promise that resolves with an object containing the user name and email.
     * @throws {FilesReportServiceError} If the command fails.
     */
    static getUser(): Promise<{
        name: string;
        email: string;
        toString: () => string;
    }>;
    /**
     * Set the user configuration in Git.
     *
     * @param name The user's name to set in the Git configuration.
     * @param email The user's email to set in the Git configuration.
     * @returns A promise that resolves when the user configuration is successfully set.
     * @throws {FilesReportServiceError} If the command fails.
     */
    static setUser(name: string, email: string): Promise<void>;
}

declare class DiffOutputFile {
    file: string;
    fileName: string;
    index: string;
    aFile: string;
    bFile: string;
    hunks: string[];
    acceptedHunks: string[];
    ignoredHunks: string[];
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
    constructor(conf: TDiffOutputFileConf);
    /**
     * Generates a diff patch string for the file, containing all hunks.
     *
     * @returns {string} A string representing the diff patch for the file.
     */
    getTotalDiffPatch(): string;
    /**
     * Generates a diff patch string for the accepted hunks of a file.
     *
     * @returns {string | null} A string representing the diff patch for the accepted hunks
     * of the file, or null if there are no accepted hunks.
     */
    getAcceptedDiffPatch(): string | null;
    /**
     * Generates a diff patch string for the ignored hunks of a file.
     *
     * @returns {string | null} A string representing the diff patch for the ignored hunks
     * of the file, or null if there are no ignored hunks.
     */
    getIgnoredDiffPatch(): string | null;
}

declare class DiffService {
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
    private static _buildDiffCommand;
    /**
     * Parses the output of a git diff command and extracts information about the files and their hunks.
     *
     * @param options Options for the git diff command.
     * @returns An array of DiffOutputFile objects, each containing details about a file and its hunks.
     *
     * The function splits the diff output into rows and iterates through them. It creates a new DiffOutputFile
     * object for each file detected in the diff output, collecting its hunks. Hunks are added to the current file
     * object until a new file is encountered.
     */
    static parseGitDiffOutput(options: GitDiffOptions): Promise<DiffOutputFile[]>;
}

declare class FilesReport {
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

declare class FilesReportService {
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
    static filesReport(): Promise<FilesReport>;
    /**
     * Get a list of Git commits.
     *
     * @param args An object with three optional properties: `from`, `to`, and `branch`.
     * `from` and `to` specify the range of commits to retrieve. If `from` is specified but `to` is not, the
     * function will retrieve all commits newer than `from`. If `to` is specified but `from` is not, the
     * function will retrieve all commits older than `to`.
     * `branch` specifies the branch from which to retrieve commits. If not specified, the function will use
     * the current branch.
     *
     * @returns A promise that resolves with an array of `GitLogCommitInfo` objects, each containing the
     * commit hash, author name, author email, commit date, commit title, and commit body.
     * @throws {ExternalServiceError} If the command fails.
     */
    static log(args?: {
        from?: string;
        to?: string;
        branch?: string;
    }): Promise<GitLogCommitInfo[]>;
}

declare class TaggerService {
    /**
     * Creates an annotated tag on the local repository.
     *
     * @param {Object} param0 The parameters for creating the annotated tag.
     * @param {string} param0.name The name of the tag to create.
     * @param {string} [param0.message] An optional message for the annotated tag.
     * @returns {Promise<string>} The result of the command.
     */
    static createAnnotatedTag({ message, name }: {
        name: string;
        message?: string;
    }): Promise<string>;
    /**
     * Creates a lightweight tag on the local repository.
     *
     * @param {string} name The name of the tag to create.
     * @returns {Promise<string>} The result of the command.
     */
    static createLightweightTag(name: string): Promise<string>;
    /**
     * Deletes a tag from the local repository.
     *
     * @param {string} name The name of the tag to delete.
     * @returns {Promise<string>} The result of the command.
     */
    static deleteTag(name: string): Promise<string>;
    /**
     * Pushes a tag to the remote repository.
     *
     * @param {string} name The name of the tag to push.
     * @returns {Promise<string>} The result of the command.
     */
    static pushTag(name: string): Promise<string>;
    /**
     * Deletes a tag from the remote repository.
     *
     * @param {string} name The name of the tag to delete.
     * @param {string} [remote='origin'] The name of the remote repository to delete the tag from.
     * @returns {Promise<string>} The result of the command.
     */
    static deleteRemoteTag(name: string, remote?: string): Promise<string>;
    /**
     * Lists all tags in the local repository.
     *
     * @returns {Promise<Array<{tag: string, commit: string}>>} A list of tags, where each tag is an object with a
     * `tag` property containing the tag name, and a `commit` property containing the commit hash the tag points to.
     * If there are no tags in the local repository, an empty list is returned.
     */
    static listTagsLocal(): Promise<{
        tag: string;
        commit: string;
    }[]>;
    /**
     * Checks if a tag exists in the local repository.
     *
     * @param tag The name of the tag to check.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if the tag exists, false otherwise.
     */
    static tagExists(tag: string): Promise<boolean>;
    /**
     * Lists all tag names in the local repository.
     *
     * @returns {Promise<string[]>} A list of tag names, or an empty list if there are no tags in the local repository.
     */
    static listTagsNamesLocal(): Promise<string[]>;
    /**
     * Lists all tags in the remote repository.
     *
     * @returns {Promise<Array<{tag: string, commit: string}>>} A list of tags, where each tag is an object with a
     * `tag` property containing the tag name, and a `commit` property containing the commit hash the tag points to.
     * If there are no tags in the remote repository, an empty list is returned.
     */
    static listTagsRemote(): Promise<{
        tag: string;
        commit: string;
    }[]>;
    /**
     * Lists all tag names in the repository, ordered by the date they were created.
     *
     * @returns {Promise<string[]>} A promise that resolves to an array of tag names, ordered by creation date.
     * The tag names are extracted and formatted from the git log command output.
     */
    static listOrderByDate(): Promise<string[]>;
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

type TAllVersionOptions = {
    type?: 'major' | 'minor' | 'patch' | 'premajor' | 'preminor' | 'prepatch' | 'prerelease' | 'from-git';
    version?: string;
    useCommitHooks?: boolean;
    createTag?: boolean;
    customMessage?: string;
    /**
     * Custom pre id for the pre*
     */
    preid?: string;
};
type TExactVersionOptions = Pick<TAllVersionOptions, 'version' | 'useCommitHooks' | 'createTag' | 'customMessage'>;
type TPreVersionOptions = Pick<TAllVersionOptions, 'preid' | 'useCommitHooks' | 'createTag' | 'customMessage'>;
type TVersionOptions = Pick<TAllVersionOptions, 'useCommitHooks' | 'createTag' | 'customMessage'>;
declare class NpmService {
    /**
     * Runs the npm version command with the given options.
     * @param data
     * @returns The output of the command as a string.
     * @throws AppError if type or version is not provided.
     * @throws AppError if both type and version are provided.
     */
    static version(data: TAllVersionOptions): Promise<string>;
    /**
     * Increases the version exactly to the given version.
     * @param data
     * @returns The output of the command as a string.
     * @throws AppError if version is not provided.
     */
    static exactVersion({ createTag, customMessage, useCommitHooks, version }: TExactVersionOptions): Promise<string>;
    /**
     * Increase the prerelease patch version.
     *
     * @example
     * await NpmService.prePatch();
     *
     * @param {Object} [options]
     * @param {boolean} [options.createTag=true] - Whether to create a new tag from the new version.
     * @param {string} [options.customMessage] - The message to use when creating a new tag.
     * @param {string} [options.preid] - The prerelease identifier to use.
     * @param {boolean} [options.useCommitHooks=true] - Whether to use the commit hooks.
     * @returns {Promise<string>}
     */
    static prePatch({ createTag, customMessage, preid, useCommitHooks }: TPreVersionOptions): Promise<string>;
    /**
     * Increase the prerelease minor version.
     *
     * @example
     * await NpmService.preMinor();
     *
     * @param {Object} [options]
     * @param {boolean} [options.createTag=true] - Whether to create a new tag from the new version.
     * @param {string} [options.customMessage] - The message to use when creating a new tag.
     * @param {string} [options.preid] - The prerelease identifier to use.
     * @param {boolean} [options.useCommitHooks=true] - Whether to use the commit hooks.
     * @returns {Promise<string>}
     */
    static preMinor({ createTag, customMessage, preid, useCommitHooks }: TPreVersionOptions): Promise<string>;
    /**
     * Increase the prerelease major version.
     *
     * @example
     * await NpmService.preMajor();
     *
     * @param {Object} [options]
     * @param {boolean} [options.createTag=true] - Whether to create a new tag from the new version.
     * @param {string} [options.customMessage] - The message to use when creating a new tag.
     * @param {string} [options.preid] - The prerelease identifier to use.
     * @param {boolean} [options.useCommitHooks=true] - Whether to use the commit hooks.
     * @returns {Promise<string>}
     */
    static preMajor({ createTag, customMessage, preid, useCommitHooks }: TPreVersionOptions): Promise<string>;
    /**
     * Increase the prerelease version.
     *
     * @example
     * await NpmService.preRelease();
     *
     * @param {Object} [options]
     * @param {boolean} [options.createTag=true] - Whether to create a new tag from the new version.
     * @param {string} [options.customMessage] - The message to use when creating a new tag.
     * @param {string} [options.preid] - Custom pre identifier for the prerelease.
     * @param {boolean} [options.useCommitHooks=true] - Whether to use the commit hooks.
     * @returns {Promise<string>}
     */
    static preRelease({ createTag, customMessage, preid, useCommitHooks }: TPreVersionOptions): Promise<string>;
    /**
     * Increase the major version.
     *
     * @example
     * await NpmService.major();
     *
     * @param {Object} [options]
     * @param {boolean} [options.createTag=true] - Whether to create a new tag from the new version.
     * @param {string} [options.customMessage] - The message to use when creating a new tag.
     * @param {boolean} [options.useCommitHooks=true] - Whether to use the commit hooks.
     * @returns {Promise<string>}
     */
    static major({ createTag, customMessage, useCommitHooks }: TVersionOptions): Promise<string>;
    /**
     * Increase the minor version.
     *
     * @example
     * await NpmService.minor();
     *
     * @param {Object} [options]
     * @param {boolean} [options.createTag=true] - Whether to create a new tag from the new version.
     * @param {string} [options.customMessage] - The message to use when creating a new tag.
     * @param {boolean} [options.useCommitHooks=true] - Whether to use the commit hooks.
     * @returns {Promise<string>}
     */
    static minor({ createTag, customMessage, useCommitHooks }: TVersionOptions): Promise<string>;
    /**
     * Increase the patch version.
     *
     * @example
     * await NpmService.patch();
     *
     * @param {Object} [options]
     * @param {boolean} [options.createTag=true] - Whether to create a new tag from the new version.
     * @param {string} [options.customMessage] - The message to use when creating a new tag.
     * @param {boolean} [options.useCommitHooks=true] - Whether to use the commit hooks.
     * @returns {Promise<string>}
     */
    static patch({ createTag, customMessage, useCommitHooks }: TVersionOptions): Promise<string>;
}

/**
 * Parse a string containing a list of tags with their commit hashes and
 * return a string with each tag in a separate line, indented by two spaces.
 * Each line is formatted as " * <tag> <commit>" and the tags are padded to
 * 15 characters.
 * @param data The string to parse.
 * @returns A string with the parsed list of tags.
 */
declare const parseTagsList: (data: string) => {
    tag: string;
    commit: string;
}[];
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

export { AppError, type CacheFile, CacheStore, ChangeLogService, CommandExecutionError, type CommandExecutionErrorConstructor, ConfigService, DiffOutputFile, DiffService, ErrorHandler, ExternalServiceError, type FileChanges, FileServiceError, FilesReport, FilesReportService, FilesReportServiceError, type GitDiffOptions, type GitLogCommitInfo, IS_DEV, IS_PROD, IS_TEST, LOG_SPLITTER, MarkdownService, NAME, NpmService, type TDiffOutputFileConf, type TFileListStatus, TMP_DIR, TMP_PATCH_DIR, TaggerService, VERSION, VERSION_NAME, createDirPath, createFileHash, exeCommand, existsPath, getFileStat, isDirectory, isFile, mf, parseTagsList, processFiles, resolvePath, rf, sha1, wf };
