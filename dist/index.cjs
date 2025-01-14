'use strict';

var crypto = require('crypto');
var node_fs = require('node:fs');
var path = require('path');
var node_os = require('node:os');
var node_path = require('node:path');
var node_url = require('node:url');
var node_child_process = require('node:child_process');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
class FileServiceError extends Error {
    file;
    action;
    constructor(message, file, action) {
        super(message);
        //super(message, 2);
        this.file = file;
        this.action = action;
    }
}
/**
 * Generates a SHA1 hash for the given content.
 * @param {string} [content] - The content to hash. If not provided, an empty hash is returned.
 * @returns {string} The SHA1 hash of the content.
 */
const sha1 = (content) => {
    const hash = crypto.createHash('sha1');
    if (content)
        hash.update(content);
    return hash.digest('hex');
};
/**
 * Reads the content of a file at the given path.
 * @param {string} path - The path to the file to be read.
 * @returns {string} The content of the file as a UTF-8 encoded string.
 * @throws {FileServiceError} If an error occurs while reading the file.
 */
const rf = (path) => {
    try {
        return node_fs.readFileSync(path, { encoding: 'utf-8' });
    }
    catch (error) {
        const err = new FileServiceError(error.message, path, 'read');
        // ErrorHandler.throw(err);
        throw err;
    }
};
/**
 * Writes data to a file at the given path.
 * @param {string} path - The path to the file where data should be written.
 * @param {string} data - The data to be written to the file.
 * @throws {FileServiceError} If an error occurs while writing to the file.
 */
const wf = (path, data) => {
    try {
        node_fs.writeFileSync(path, data, { encoding: 'utf-8' });
    }
    catch (error) {
        const err = new FileServiceError(error.message, path, 'read');
        // ErrorHandler.throw(err);
        throw err;
    }
};
/**
 * Creates a SHA1 hash of a given file.
 * @param {string} filePath - The content of the file to hash.
 * @returns {string} The SHA1 hash of the given file.
 */
const createFileHash = (filePath) => {
    const hash = crypto.createHash('sha1');
    hash.update(rf(filePath));
    return hash.digest('hex');
};
/**
 * Resolves a given path relative to the current working directory.
 *
 * @param {string} path - The path to be resolved.
 * @param {string} cwd - The current working directory.
 * @returns {string} The resolved absolute path.
 */
const resolvePath = (path$1, cwd = process.cwd()) => {
    if (path$1.startsWith(cwd))
        return path.join(path$1, '');
    return path.join(cwd, path$1);
};
/**
 * Checks if a file or directory exists at the specified path.
 *
 * @param {string} path - The path to check for existence.
 * @returns {boolean} True if the path exists, false otherwise.
 */
const existsPath = (path) => {
    return node_fs.existsSync(resolvePath(path));
};
/**
 * Creates the directory path if it does not exist.
 *
 * @param {string} path - The path to the directory to be created.
 * @returns {void}
 */
const createDirPath = (path$1) => {
    if (existsPath(path$1))
        return;
    node_fs.mkdirSync(path.dirname(path$1), { recursive: true });
};
/**
 * Moves a file from the origin path to the destination path.
 * @param {string} originPath - The path to the file to be moved.
 * @param {string} destinationPath - The path where the file should be moved to.
 * @param {string} [cwd=process.cwd()] - The current working directory. Defaults to the process's cwd.
 * @throws {FileServiceError} If the file does not exist at the given path.
 */
const mf = (originPath, destinationPath, cwd = process.cwd()) => {
    const parsedOriginRoute = resolvePath(originPath, cwd);
    const parsedDestinationRoute = resolvePath(destinationPath, cwd);
    if (!existsPath(parsedOriginRoute)) {
        const error = new FileServiceError(`The file at '${parsedOriginRoute}' does not exist.`, parsedOriginRoute, 'read');
        // ErrorHandler.throw(error);
        throw error;
    }
    createDirPath(parsedDestinationRoute);
    // const destinationDirName = dirname(parsedDestinationRoute);
    // if (!existsPath(destinationDirName)) mkdirSync(destinationDirName, { recursive: true });
    node_fs.renameSync(parsedOriginRoute, parsedDestinationRoute);
};
/**
 * Gets the stats of a file at the given path.
 *
 * @param {string} path - The path to the file to get the stats from.
 * @returns {import("node:fs").Stats} The stats of the file.
 * @throws {FileServiceError} If the file does not exist at the given path.
 */
const getFileStat = (path) => {
    if (!existsPath(path)) {
        const error = new FileServiceError(`The file at '${path}' does not exist.`, path, 'read');
        // ErrorHandler.throw(error);
        throw error;
    }
    try {
        return node_fs.statSync(path);
    }
    catch (error) {
        const err = new FileServiceError(error.message, path, 'read');
        // ErrorHandler.throw(err);
        throw err;
    }
};
/**
 * Checks if the given path is a file.
 * @param {string} path - The path to check.
 * @returns {boolean} True if the path is a file, false otherwise.
 */
const isFile = (path) => {
    try {
        return getFileStat(path)?.isFile();
    }
    catch (error) {
        return false;
    }
};
/**
 * Checks if the given path is a directory.
 * @param {string} path - The path to check.
 * @returns {boolean} True if the path is a directory, false otherwise.
 */
const isDirectory = (path) => {
    try {
        return getFileStat(path)?.isDirectory();
    }
    catch (error) {
        return false;
    }
};

const TMP_DIR = node_path.join(node_os.tmpdir(), 'taskgit');
const TMP_PATCH_DIR = node_path.join(TMP_DIR, 'patch');
const pkg = JSON.parse(rf(node_path.join(node_url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('index.cjs', document.baseURI).href))), '..', '..', './package.json')));
const NAME = pkg.name;
const VERSION = pkg.version;
const VERSION_NAME = `${NAME}@${VERSION}`;
const IS_DEV = ['dev', 'development'].includes(process.env.NODE_ENV);
const IS_PROD = ['production', 'prod', 'staging', 'stg', 'stage'].includes(process.env.NODE_ENV);
const IS_TEST = process.env.NODE_ENV === 'test';
const LOG_SPLITTER = '_$ ò $_';

if (!node_fs.existsSync(TMP_DIR)) {
    node_fs.mkdirSync(TMP_DIR);
}
if (!node_fs.existsSync(TMP_PATCH_DIR)) {
    node_fs.mkdirSync(TMP_PATCH_DIR);
}
class CacheStore {
    static instance; // Instancia estática de la clase
    files;
    constructor() {
        this.files = {};
        if (!CacheStore.instance) {
            CacheStore.instance = this;
        }
        return CacheStore.instance;
    }
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
    createPatchCache(file) {
        const hash = sha1(file.filePath + Date.now().toString(16));
        const chacheFilePath = node_path.join(TMP_PATCH_DIR, hash);
        const fileChanges = {
            hash,
            acceptedChanges: {
                cacheFilePath: chacheFilePath + '-ac.patch',
                content: file.acceptedDiff
            },
            originalState: {
                cacheFilePath: chacheFilePath + '-or.patch',
                content: file.originalDiff
            }
        };
        if (file.ignoredDiff)
            fileChanges.ignoredChanges = {
                cacheFilePath: chacheFilePath + '-ig.patch',
                content: file.ignoredDiff
            };
        node_fs.writeFileSync(fileChanges.originalState.cacheFilePath, fileChanges.originalState.content);
        node_fs.writeFileSync(fileChanges.acceptedChanges.cacheFilePath, fileChanges.acceptedChanges.content);
        if (fileChanges.ignoredChanges)
            node_fs.writeFileSync(fileChanges.ignoredChanges.cacheFilePath, fileChanges.ignoredChanges.content);
        this.files[hash] = fileChanges;
        return hash;
    }
    /**
     * Returns the cache stored with the given hash.
     *
     * @param {string} hash - The hash of the cache to retrieve
     * @returns {FileChanges} The cache or undefined if it does not exist
     */
    getFileCache(hash) {
        return this.files[hash];
    }
    /**
     * Clears the file cache associated with the given hash.
     *
     * @param {string} hash - The hash of the cache to clear.
     * @returns {boolean} - Returns false if the cache does not exist.
     * Deletes the cached files for the original state, accepted changes,
     * and ignored changes if they exist.
     */
    clearFileCache(hash) {
        const file = this.getFileCache(hash);
        if (!file)
            return false;
        node_fs.unlinkSync(file.originalState.cacheFilePath);
        node_fs.unlinkSync(file.acceptedChanges.cacheFilePath);
        if (file.ignoredChanges)
            node_fs.unlinkSync(file.ignoredChanges.cacheFilePath);
        return true;
    }
}

class MarkdownService {
    _content;
    constructor() {
        this._content = ''; // Inicializamos el contenido vacío
    }
    /**
     * Adds a title to the markdown content.
     * @param {string} text The text of the title.
     * @param {number} [level=1] The level of the title, from 1 to 6.
     * @returns {this} The markdown service to chain methods.
     */
    addTitle(text, level = 1) {
        const title = '#'.repeat(level) + ` ${text}\n`;
        this._content += title;
        return this;
    }
    /**
     * Adds a paragraph to the markdown content.
     * @param {string} text The text of the paragraph.
     * @returns {this} The markdown service to chain methods.
     */
    addParagraph(text) {
        this._content += `${text}\n\n`;
        return this;
    }
    /**
     * Adds a specified number of end lines to the markdown content.
     * @param {number} [ammount=1] The number of end lines to add.
     * @returns {this} The markdown service to chain methods.
     */
    addEndLine(ammount = 1) {
        this._content += '\n'.repeat(ammount);
        return this;
    }
    /**
     * Add an unordered list to the markdown content.
     * @param {string[]} items The items to include in the unordered list.
     * @returns {this} The markdown service to chain methods.
     */
    addUnorderedList(items) {
        items.forEach(item => {
            this._content += `- ${item}\n`;
        });
        this._content += '\n';
        return this;
    }
    /**
     * Add an ordered list to the markdown content.
     * @param {string[]} items The items to include in the ordered list.
     * @returns {this} The markdown service to chain methods.
     */
    addOrderedList(items) {
        items.forEach((item, index) => {
            this._content += `${index + 1}. ${item}\n`;
        });
        this._content += '\n';
        return this;
    }
    /**
     * Add a link to the markdown content.
     * @param {string} text The text of the link.
     * @param {string} url The URL of the link.
     * @returns {this} The markdown service to chain methods.
     */
    addLink(text, url) {
        this._content += `[${text}](${url})\n`;
        return this;
    }
    /**
     * Add a code block to the markdown content.
     * @param {string} code The code to add.
     * @param {string} [language='typescript'] The language of the code block.
     * @returns {this} The markdown service to chain methods.
     */
    addCodeBlock(code, language = 'typescript') {
        this._content += `\`\`\`${language}\n${code}\n\`\`\`\n`;
        return this;
    }
    /**
     * Getter for the markdown content.
     * @returns {string} The markdown content.
     */
    get contentMarkdown() {
        return this._content;
    }
    /**
     * Resets the markdown content to an empty string.
     * @returns {this} The markdown service to chain methods.
     */
    clear() {
        this._content = '';
        return this;
    }
    /**
     * Outputs the current markdown content to a file.
     * @param {string} path - The path to the file where the markdown content should be written.
     * @returns {this} The markdown service to chain methods.
     * @throws {FileServiceError} If an error occurs while writing to the file.
     */
    outputToFile(path) {
        wf(path, this._content);
        return this;
    }
    /**
     * Adds a string of plain text to the markdown content. (NO ENDLINE)
     * @param {string} text The text to add.
     * @returns {this} The markdown service to chain methods.
     */
    addText(text) {
        this._content += text;
        return this;
    }
}

class ChangeLogService {
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
    static groupCommitSections(commits) {
        const sections = {
            added: [],
            fixed: [],
            documentation: [],
            changed: [],
            removed: [],
            deprecated: [],
            security: []
        };
        const keywordsMap = {
            feat: 'added',
            fix: 'fixed',
            docs: 'documentation',
            style: 'changed',
            refactor: 'changed',
            perf: 'changed',
            test: 'changed',
            chore: 'changed',
            build: 'changed',
            ci: 'changed',
            removed: 'removed',
            deprecated: 'deprecated',
            security: 'security'
        };
        commits.forEach(commit => {
            const title = commit.title.toLowerCase();
            for (const keyword in keywordsMap) {
                if (title.startsWith(keyword)) {
                    sections[keywordsMap[keyword]].push(commit);
                    break;
                }
            }
        });
        return sections;
    }
    /**
     * Generates a changelog file based on a list of commit objects.
     *
     * @param {object} data - An object containing the commits, version, and optional output file name.
     * @param {GitLogCommitInfo[]} data.commits - An array of commit objects.
     * @param {string} data.version - The version number to include in the changelog.
     * @param {string} [data.outputFile='changelog.md'] - The file name to save the changelog to.
     */
    static generateChangelog(data) {
        const { commits, version, outputFile = 'changelog.md' } = data;
        const sections = this.groupCommitSections(commits);
        const md = new MarkdownService();
        md.addTitle('Changelog')
            .addEndLine()
            .addTitle(`${version} - ${new Date().toISOString().split('T')[0]}`, 2);
        this._writeSection(sections.added, 'Added', md);
        this._writeSection(sections.fixed, 'Fixed', md);
        this._writeSection(sections.changed, 'Changed', md);
        this._writeSection(sections.removed, 'Removed', md);
        this._writeSection(sections.documentation, 'Documentation', md);
        this._writeSection(sections.deprecated, 'Deprecated', md);
        this._writeSection(sections.security, 'Security', md);
        wf(outputFile, md.contentMarkdown);
    }
    /**
     * Writes a section in the markdown document for a given list of commits.
     *
     * @param {GitLogCommitInfo[]} commits - An array of commit objects to be included in the section.
     * @param {string} title - The title of the section to be added to the markdown document.
     * @param {MarkdownService} md - The markdown service instance used to create and modify the markdown content.
     *
     * @returns {void}
     */
    static _writeSection(commits, title, md) {
        if (commits.length === 0)
            return void 0;
        md.addTitle(title, 2).addUnorderedList(commits.map(commit => {
            let message = `${commit.title} (#${commit.hash.slice(0, 7)}) - ${commit.author.name} \\<${commit.author.email}>`;
            if (commit.body.length > 0)
                message += `\n\n  ${commit.body.split('\n').join('\n  ')}`;
            return message;
        }));
    }
}

class AppError extends Error {
    errorTracks;
    static VERSION = VERSION;
    static NAME = NAME;
    static VERSION_NAME = VERSION_NAME;
    exitCode;
    constructor(message, exitCode = 1) {
        super(message);
        this.name = 'AppError';
        this.exitCode = exitCode;
        this.errorTracks = this.stack
            ? this.stack
                .split('\n')
                .filter(l => l.includes('    at '))
                .map(l => l.trim())
            : [];
    }
    get errorTrack() {
        return this.errorTracks.map(l => `    ${l}`).join('\n');
    }
    get lastTrack() {
        return this.errorTracks[0];
    }
    get VERSION() {
        return AppError.VERSION;
    }
    get NAME() {
        return AppError.NAME;
    }
    get VERSION_NAME() {
        return AppError.VERSION_NAME;
    }
}
class FilesReportServiceError extends AppError {
    command;
    constructor(message, command) {
        super(message, 2);
        this.name = 'FilesReportServiceError';
        this.command = command;
    }
}
class ExternalServiceError extends AppError {
    service;
    constructor(message, service) {
        super(message, 2);
        this.name = 'ExternalServiceError';
        this.service = service;
    }
}
class CommandExecutionError extends AppError {
    command;
    error;
    stdout;
    stderr;
    constructor({ command, error, message, stderr, stdout }) {
        super(message, 1);
        this.name = 'CommandExecutionError';
        this.command = command;
        this.error = error;
        this.stderr = stderr;
        this.stdout = stdout;
    }
}
class ErrorHandler {
    static _subscriber = [];
    static subscribe(subscriber) {
        this._subscriber.push(subscriber);
        return () => this.unsubscribe(subscriber);
    }
    static unsubscribe(subscriber) {
        this._subscriber = this._subscriber.filter(s => s !== subscriber);
    }
    static throw(error) {
        let i = 0;
        this._subscriber.forEach(s => {
            s(error);
            i++;
        });
        if (i === 0)
            throw error;
    }
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
const exeCommand = async (command, onError = () => false) => {
    if (Array.isArray(command))
        command = command.map(transformCommandArg).join(' ');
    else {
        const regex = /"[^"]*"|[^ ]+/g;
        const marches = command.match(regex);
        if (marches !== null)
            command = marches.map(transformCommandArg).join(' ');
        else
            command = transformCommandArg(command);
    }
    return new Promise(resolve => {
        node_child_process.exec(command, async (error, stdout, stderr) => {
            const mssg = stdout.length > 0 ? stdout : stderr;
            if (error) {
                const e = new CommandExecutionError({ command, error, message: error.message, stderr, stdout });
                if (await onError(e))
                    ErrorHandler.throw(e);
            }
            resolve(mssg);
        });
    });
};
/**
 * Checks if a given string is a safe command argument.
 *
 * This function evaluates whether the input string contains only
 * characters that are considered safe for use in shell commands,
 * i.e., it does not contain any special characters that could
 * alter the behavior of the shell command.
 *
 * @param arg The string to evaluate.
 * @returns A boolean indicating if the string is safe (true) or not (false).
 */
const isSafeCommandArg = (arg) => {
    if (typeof arg !== 'string')
        return false;
    const regex = /^[^|><&$`"'\(\)\;\\ ]+$/;
    return regex.test(arg);
};
/**
 * Replaces special characters in a string with an empty string.
 *
 * This function takes a string and replaces any special characters
 * that are not allowed in shell commands with an empty string. The
 * replaced characters are: |, <, >, &, $, `, ", ', (, ), \, ;
 * and space.
 *
 * @param arg The string to process.
 * @returns The string with all special characters replaced.
 */
const eliminateSpecialCharacters = (arg) => {
    //return arg.replace(regex, '');
    return arg;
};
/**
 * Transforms a command argument into a safe string that can be used in shell
 * commands.
 *
 * This function splits the argument into individual words and checks if
 * each word is a safe command argument. If a word is not safe, it is
 * replaced with an empty string.
 *
 * If the argument was split into multiple words, the resulting array is
 * joined back together with a space separator and enclosed in double
 * quotes.
 *
 * @param arg The string to transform.
 * @returns The transformed string.
 */
const transformCommandArg = (arg) => {
    if (typeof arg !== 'string')
        ErrorHandler.throw(new AppError('An internal error has occurred. Please review your configuration or consult the documentation.'));
    let v = arg
        .split(' ')
        .map(eliminateSpecialCharacters)
        .map(a => isSafeCommandArg(a)
        ? a
        : (ErrorHandler.throw(new AppError('An internal error has occurred. Please review your configuration or consult the documentation.')) ?? ''));
    if (v.length > 1)
        return ['"', v.join(' '), '"'].join('');
    else
        return v.join('');
};

class ConfigService {
    /**
     * Get the user configuration from Git.
     *
     * @returns A promise that resolves with an object containing the user name and email.
     * @throws {FilesReportServiceError} If the command fails.
     */
    static async getUser() {
        const name = await exeCommand('git config user.name');
        const email = await exeCommand('git config user.email');
        return { name, email, toString: () => `${name} <${email}>` };
    }
    /**
     * Set the user configuration in Git.
     *
     * @param name The user's name to set in the Git configuration.
     * @param email The user's email to set in the Git configuration.
     * @returns A promise that resolves when the user configuration is successfully set.
     * @throws {FilesReportServiceError} If the command fails.
     */
    static async setUser(name, email) {
        await exeCommand(`git config user.name "${name}" && git config user.email "${email}"`);
    }
}

class DiffOutputFile {
    file;
    fileName;
    index;
    aFile;
    bFile;
    hunks;
    acceptedHunks;
    ignoredHunks;
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
    constructor(conf) {
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
    getTotalDiffPatch() {
        let patch = `diff --git ${this.file}`;
        patch += `\n${this.index}`;
        patch += `\n${this.aFile}`;
        patch += `\n${this.bFile}`;
        patch += `\n${this.hunks.join('\n')}`;
        if (!patch.endsWith('\n'))
            patch += '\n';
        return patch;
    }
    /**
     * Generates a diff patch string for the accepted hunks of a file.
     *
     * @returns {string | null} A string representing the diff patch for the accepted hunks
     * of the file, or null if there are no accepted hunks.
     */
    getAcceptedDiffPatch() {
        if (this.acceptedHunks.length === 0)
            return null;
        let patch = `diff --git ${this.file}`;
        patch += `\n${this.index}`;
        patch += `\n${this.aFile}`;
        patch += `\n${this.bFile}`;
        patch += `\n${this.acceptedHunks.join('\n')}`;
        if (!patch.endsWith('\n'))
            patch += '\n';
        return patch;
    }
    /**
     * Generates a diff patch string for the ignored hunks of a file.
     *
     * @returns {string | null} A string representing the diff patch for the ignored hunks
     * of the file, or null if there are no ignored hunks.
     */
    getIgnoredDiffPatch() {
        if (this.ignoredHunks.length === 0)
            return null;
        let patch = `diff --git ${this.file}`;
        patch += `\n${this.index}`;
        patch += `\n${this.aFile}`;
        patch += `\n${this.bFile}`;
        patch += `\n${this.ignoredHunks.join('\n')}`;
        if (!patch.endsWith('\n'))
            patch += '\n';
        return patch;
    }
}

class DiffService {
    /**
     * Execute the git diff command with the provided options.
     * @param options Options for the git diff command.
     * @returns The output of the git diff command.
     */
    static async diff(options) {
        const command = this._buildDiffCommand(options);
        return exeCommand(command);
    }
    /**
     * Build the git diff command based on the provided options.
     * @param options Options for the git diff command.
     * @returns The built git diff command.
     */
    static _buildDiffCommand(options) {
        let command = 'git diff';
        // Add branch(es) or file
        if (options.branch1 && options.branch2) {
            command += ` ${options.branch1}..${options.branch2}`;
        }
        else if (options.branch1 && options.branch2 && options.commit1 && options.commit2) {
            command += ` ${options.branch1}...${options.branch2}`;
        }
        else if (options.file) {
            command += ` -- ${options.file}`;
        }
        // Add ignore whitespace options
        const ignoreSpaceOptions = [
            { option: options.ignoreAllSpace, flag: '--ignore-all-space' },
            { option: options.ignoreBlankLines, flag: '--ignore-blank-lines' },
            { option: options.ignoreSpaceAtEol, flag: '--ignore-space-at-eol' },
            { option: options.ignoreSpaceChanges, flag: '-b' },
            { option: options.ignoreSpace, flag: '-w' },
            { option: options.ignoreTrailingSpace, flag: '-w' },
            { option: options.ignoreSpaceChangesBetweenLines, flag: '-b' }
        ];
        ignoreSpaceOptions.forEach(option => {
            if (option.option) {
                command += ` ${option.flag}`;
            }
        });
        // Add format options
        const formatOptions = [
            { option: options.minimal, flag: '--minimal' },
            { option: options.patience, flag: '--patience' },
            { option: options.histogram, flag: '--histogram' },
            { option: options.raw, flag: '--raw' },
            { option: options.patch, flag: '--patch' },
            { option: options.stat, flag: '--stat' },
            { option: options.numstat, flag: '--numstat' },
            { option: options.shortstat, flag: '--shortstat' }
        ];
        formatOptions.forEach(option => {
            if (option.option) {
                command += ` ${option.flag}`;
            }
        });
        return command;
    }
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
    static async parseGitDiffOutput(options) {
        const diffOutput = await this.diff(options);
        const lines = diffOutput.split('\n');
        const parsedFiles = [];
        let currentHunk = '';
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('diff --git')) {
                const lastFile = parsedFiles[parsedFiles.length - 1];
                if (lastFile) {
                    lastFile.hunks.push(currentHunk);
                }
                currentHunk = '';
                const newFile = new DiffOutputFile({
                    file: line.replace('diff --git ', ''),
                    fileName: line.replace('diff --git ', '').split(' ')[0].replace('a/', ''),
                    index: lines[i + 1],
                    aFile: lines[i + 2],
                    bFile: lines[i + 3],
                    hunks: []
                });
                parsedFiles.push(newFile);
                i += 3;
            }
            else if (line.startsWith('@@')) {
                const lastFile = parsedFiles[parsedFiles.length - 1];
                if (lastFile) {
                    lastFile.hunks.push(currentHunk);
                }
                //currentHunk = line + '\n';
                currentHunk = line;
            }
            else {
                //currentHunk += `${line}\n`;
                currentHunk += `\n${line}`;
            }
        }
        const lastFile = parsedFiles[parsedFiles.length - 1];
        if (lastFile) {
            lastFile.hunks.push(currentHunk);
        }
        parsedFiles.forEach(file => {
            file.hunks = file.hunks.filter(hunk => hunk.length > 0);
        });
        return parsedFiles;
    }
}

class FilesReport {
    staged;
    unstaged;
    untracked;
    constructor({ staged, unstaged, untracked }) {
        this.staged = staged;
        this.unstaged = unstaged;
        this.untracked = untracked;
    }
    _fileListStatus(list) {
        let report = '';
        list.added.forEach(f => (report += `\nA  ${f}`));
        list.modified.forEach(f => (report += `\nM  ${f}`));
        list.deleted.forEach(f => (report += `\nD  ${f}`));
        return report;
    }
    stagedReport() {
        let report = '';
        if (this.staged.added.length > 0 || this.staged.modified.length > 0 || this.staged.deleted.length > 0)
            report += '\nStaged files:';
        report += this._fileListStatus(this.staged);
        return report;
    }
    unstagedReport() {
        let report = '';
        if (this.unstaged.added.length > 0 || this.unstaged.modified.length > 0 || this.unstaged.deleted.length > 0)
            report += '\nUnstaged files:';
        report += this._fileListStatus(this.unstaged);
        return report;
    }
    untrackedReport() {
        let report = '';
        if (this.untracked.length > 0)
            report += '\nUntracked files:';
        this.untracked.forEach(f => (report += `\nU  ${f}`));
        return report;
    }
    totalReport() {
        let report = '';
        report += [this.stagedReport(), this.unstagedReport(), this.untrackedReport()].join('\n');
        return report;
    }
}

/**
 * Parse a string containing a list of tags with their commit hashes and
 * return a string with each tag in a separate line, indented by two spaces.
 * Each line is formatted as " * <tag> <commit>" and the tags are padded to
 * 15 characters.
 * @param data The string to parse.
 * @returns A string with the parsed list of tags.
 */
const parseTagsList = (data) => {
    return data
        .split('\n')
        .filter(l => l.length > 0)
        .map(l => {
        let [commit, tag] = l.replace('refs/tags/', '').replace(/\s+/g, ' ').trim().split(' ');
        Array.from({ length: 15 }, (_, i) => tag[i] ?? ' ').join('');
        tag = tag.replace('^{}', '');
        return { tag, commit };
    });
};
/**
 * Process a string containing a list of files with their status (from Git)
 * and return an object with three properties: added, modified and deleted.
 * Each property is an array of strings, containing the names of the files
 * that have been added, modified or deleted.
 *
 * @param data The string to process.
 * @returns An object with three properties: added, modified and deleted.
 */
const processFiles = (data) => {
    const files = { added: [], modified: [], deleted: [] };
    data.split('\n')
        .map(line => line.trim())
        .forEach(line => {
        const status = line.charAt(0);
        const file = line.slice(2).trim();
        if (status === 'A')
            files.added.push(file);
        else if (status === 'M')
            files.modified.push(file);
        else if (status === 'D')
            files.deleted.push(file);
    });
    return files;
};

class FilesReportService {
    /**
     * Get a list of staged files from Git.
     *
     * @returns A promise that resolves with an object containing three properties: added, modified and deleted.
     * Each property is an array of strings, containing the names of the files that have been added, modified or
     * deleted, respectively.
     * @throws {ExternalServiceError} If the command fails.
     */
    static listStagedFiles = async () => {
        const data = await exeCommand('git diff --name-status --staged');
        return processFiles(data);
    };
    /**
     * Get a list of unstaged files from Git.
     *
     * @returns A promise that resolves with an object containing three properties: added, modified, and deleted.
     * Each property is an array of strings, containing the names of the files that have been added, modified, or
     * deleted, respectively.
     * @throws {ExternalServiceError} If the command fails.
     */
    static async listUnstagedFiles() {
        const data = await exeCommand('git diff --name-status');
        return processFiles(data);
    }
    /**
     * Get a list of untracked files from Git.
     *
     * @returns A promise that resolves with an array of strings, containing the names of the files that are not
     * tracked by Git.
     * @throws {ExternalServiceError} If the command fails.
     */
    static async listUntrackedFiles() {
        const data = await exeCommand('git ls-files --others --exclude-standard');
        return data
            .split('\n')
            .map(line => line.trim())
            .filter(f => f.length > 0);
    }
    /**
     * Get a report of the files in the Git repository, including staged, unstaged, and untracked files.
     *
     * @returns A promise that resolves with an object containing the file lists.
     * @throws {ExternalServiceError} If the command fails.
     */
    static async filesReport() {
        const staged = await this.listStagedFiles();
        const unstaged = await this.listUnstagedFiles();
        const untracked = await this.listUntrackedFiles();
        return new FilesReport({ staged, unstaged, untracked });
    }
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
    static async log(args = {}) {
        const { from, to, branch = 'master' } = args;
        let command = `git log ${branch} --pretty=format:"%H%n%an%n%ae%n%ad%n%s%n%b${LOG_SPLITTER}"`;
        if (from)
            command += ` ${from}..${to ?? ''}`;
        const log = await exeCommand(command);
        return log
            .split(LOG_SPLITTER)
            .filter(l => l.length > 0)
            .map(c => {
            const [hash, authorName, email, date, message, ...body] = c
                .trim()
                .split('\n')
                .map(l => l.trim());
            return {
                hash: hash.trim(),
                author: { name: authorName.trim(), email: email.trim() },
                date: date.trim(),
                title: message.trim(),
                body: body.join('\n').trim()
            };
        });
    }
}

class TaggerService {
    /**
     * Creates an annotated tag on the local repository.
     *
     * @param {Object} param0 The parameters for creating the annotated tag.
     * @param {string} param0.name The name of the tag to create.
     * @param {string} [param0.message] An optional message for the annotated tag.
     * @returns {Promise<string>} The result of the command.
     */
    static async createAnnotatedTag({ message, name }) {
        let command = `git tag -a ${name}`;
        if (message)
            command += ` -m "${message}"`;
        return await exeCommand(command);
    }
    /**
     * Creates a lightweight tag on the local repository.
     *
     * @param {string} name The name of the tag to create.
     * @returns {Promise<string>} The result of the command.
     */
    static async createLightweightTag(name) {
        return await exeCommand(`git tag ${name}`);
    }
    /**
     * Deletes a tag from the local repository.
     *
     * @param {string} name The name of the tag to delete.
     * @returns {Promise<string>} The result of the command.
     */
    static async deleteTag(name) {
        return await exeCommand(`git tag -d ${name}`);
    }
    /**
     * Pushes a tag to the remote repository.
     *
     * @param {string} name The name of the tag to push.
     * @returns {Promise<string>} The result of the command.
     */
    static async pushTag(name) {
        return await exeCommand(`git push origin ${name}`);
    }
    /**
     * Deletes a tag from the remote repository.
     *
     * @param {string} name The name of the tag to delete.
     * @param {string} [remote='origin'] The name of the remote repository to delete the tag from.
     * @returns {Promise<string>} The result of the command.
     */
    static async deleteRemoteTag(name, remote = 'origin') {
        return await exeCommand(`git push --delete ${remote} ${name}`);
    }
    /**
     * Lists all tags in the local repository.
     *
     * @returns {Promise<Array<{tag: string, commit: string}>>} A list of tags, where each tag is an object with a
     * `tag` property containing the tag name, and a `commit` property containing the commit hash the tag points to.
     * If there are no tags in the local repository, an empty list is returned.
     */
    static async listTagsLocal() {
        const list = parseTagsList(await exeCommand('git show-ref --tags'));
        return list.length === 0 ? [] : list;
    }
    /**
     * Checks if a tag exists in the local repository.
     *
     * @param tag The name of the tag to check.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if the tag exists, false otherwise.
     */
    static async tagExists(tag) {
        const tags = await this.listTagsNamesLocal();
        return tags.includes(tag);
    }
    /**
     * Lists all tag names in the local repository.
     *
     * @returns {Promise<string[]>} A list of tag names, or an empty list if there are no tags in the local repository.
     */
    static async listTagsNamesLocal() {
        return (await exeCommand('git tag')).split('\n');
    }
    /**
     * Lists all tags in the remote repository.
     *
     * @returns {Promise<Array<{tag: string, commit: string}>>} A list of tags, where each tag is an object with a
     * `tag` property containing the tag name, and a `commit` property containing the commit hash the tag points to.
     * If there are no tags in the remote repository, an empty list is returned.
     */
    static async listTagsRemote() {
        const list = parseTagsList((await exeCommand('git ls-remote --tags')).slice(1));
        return list.length === 0 ? [] : list;
    }
    /**
     * Lists all tag names in the repository, ordered by the date they were created.
     *
     * @returns {Promise<string[]>} A promise that resolves to an array of tag names, ordered by creation date.
     * The tag names are extracted and formatted from the git log command output.
     */
    static async listOrderByDate() {
        //git log --tags --simplify-by-decoration --pretty="format:%d" --abbrev-commit
        const data = await exeCommand('git log --tags --simplify-by-decoration --pretty="format:%d" --abbrev-commit');
        const value = data
            .split('\n')
            .filter(v => v.length > 0)
            .map(v => {
            v = v.replace('(tag: ', '');
            v = v.replace(')', '');
            v = v.split(' ')[1];
            v = v.replace(',', '');
            return v;
        });
        return value;
    }
}

class NpmService {
    /**
     * Runs the npm version command with the given options.
     * @param data
     * @returns The output of the command as a string.
     * @throws AppError if type or version is not provided.
     * @throws AppError if both type and version are provided.
     */
    static async version(data) {
        let command = ['npm version'];
        if (!data.type && !data.version)
            ErrorHandler.throw(new AppError('Type or version must be provided for this option.'));
        if (data.type && data.version)
            console.warn('Type and version cannot be provided at the same time. Ommitted version.');
        command.push(data.version || data.type);
        if (!data.useCommitHooks)
            command.push('--no-commit-hooks');
        if (!data.createTag)
            command.push('--no-git-tag-version');
        if (data.preid) {
            if (!['premajor', 'preminor', 'prepatch', 'prerelease'].includes(data.type))
                console.warn('Preid can only be used with "premajor", "preminor", "prepatch" or "prerelease" this option has no effect.');
            else
                command.push(`--preid=${data.preid}`);
        }
        if (data.customMessage)
            command.push(`--message="${data.customMessage}"`);
        command.push('--json');
        console.log(command.join(' '));
        return await exeCommand(command.join(' '));
    }
    /**
     * Increases the version exactly to the given version.
     * @param data
     * @returns The output of the command as a string.
     * @throws AppError if version is not provided.
     */
    static async exactVersion({ createTag, customMessage, useCommitHooks, version }) {
        return await this.version({ createTag, customMessage, useCommitHooks, version });
    }
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
    static async prePatch({ createTag, customMessage, preid, useCommitHooks }) {
        return await this.version({ createTag, customMessage, preid, useCommitHooks, type: 'prepatch' });
    }
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
    static async preMinor({ createTag, customMessage, preid, useCommitHooks }) {
        return await this.version({ createTag, customMessage, preid, useCommitHooks, type: 'preminor' });
    }
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
    static async preMajor({ createTag, customMessage, preid, useCommitHooks }) {
        return await this.version({ createTag, customMessage, preid, useCommitHooks, type: 'premajor' });
    }
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
    static async preRelease({ createTag, customMessage, preid, useCommitHooks }) {
        return await this.version({ createTag, customMessage, preid, useCommitHooks, type: 'prerelease' });
    }
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
    static async major({ createTag, customMessage, useCommitHooks }) {
        return await this.version({ type: 'major', createTag, customMessage, useCommitHooks });
    }
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
    static async minor({ createTag, customMessage, useCommitHooks }) {
        return await this.version({ type: 'minor', createTag, customMessage, useCommitHooks });
    }
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
    static async patch({ createTag, customMessage, useCommitHooks }) {
        return await this.version({ type: 'patch', createTag, customMessage, useCommitHooks });
    }
}

exports.AppError = AppError;
exports.CacheStore = CacheStore;
exports.ChangeLogService = ChangeLogService;
exports.CommandExecutionError = CommandExecutionError;
exports.ConfigService = ConfigService;
exports.DiffOutputFile = DiffOutputFile;
exports.DiffService = DiffService;
exports.ErrorHandler = ErrorHandler;
exports.ExternalServiceError = ExternalServiceError;
exports.FileServiceError = FileServiceError;
exports.FilesReport = FilesReport;
exports.FilesReportService = FilesReportService;
exports.FilesReportServiceError = FilesReportServiceError;
exports.IS_DEV = IS_DEV;
exports.IS_PROD = IS_PROD;
exports.IS_TEST = IS_TEST;
exports.LOG_SPLITTER = LOG_SPLITTER;
exports.MarkdownService = MarkdownService;
exports.NAME = NAME;
exports.NpmService = NpmService;
exports.TMP_DIR = TMP_DIR;
exports.TMP_PATCH_DIR = TMP_PATCH_DIR;
exports.TaggerService = TaggerService;
exports.VERSION = VERSION;
exports.VERSION_NAME = VERSION_NAME;
exports.createDirPath = createDirPath;
exports.createFileHash = createFileHash;
exports.exeCommand = exeCommand;
exports.existsPath = existsPath;
exports.getFileStat = getFileStat;
exports.isDirectory = isDirectory;
exports.isFile = isFile;
exports.mf = mf;
exports.parseTagsList = parseTagsList;
exports.processFiles = processFiles;
exports.resolvePath = resolvePath;
exports.rf = rf;
exports.sha1 = sha1;
exports.wf = wf;
