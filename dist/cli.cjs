#!/usr/bin/env node
'use strict';

var node_os = require('node:os');
var node_path = require('node:path');
var node_url = require('node:url');
var crypto = require('crypto');
var node_fs = require('node:fs');
require('path');
var node_child_process = require('node:child_process');
var readline$1 = require('readline');
var promises = require('node:readline/promises');
var readline = require('node:readline');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var readline__namespace = /*#__PURE__*/_interopNamespaceDefault(readline);

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

const TMP_DIR = node_path.join(node_os.tmpdir(), 'taskgit');
const TMP_PATCH_DIR = node_path.join(TMP_DIR, 'patch');
const pkg = JSON.parse(rf(node_path.join(node_url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('cli.cjs', document.baseURI).href))), '..', '..', './package.json')));
const NAME = pkg.name;
const VERSION = pkg.version;
const VERSION_NAME = `${NAME}@${VERSION}`;
const IS_DEV = ['dev', 'development'].includes(process.env.NODE_ENV);
['production', 'prod', 'staging', 'stg', 'stage'].includes(process.env.NODE_ENV);
const IS_TEST = process.env.NODE_ENV === 'test';
const LOG_SPLITTER = '_$ ò $_';

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
class GitServiceError extends AppError {
    command;
    constructor(message, command) {
        super(message, 2);
        this.name = 'GitServiceError';
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
    getFileCache(hash) {
        return this.files[hash];
    }
    clearFileCache(hash) {
        const file = this.getFileCache(hash);
        if (!file)
            return false;
        node_fs.unlinkSync(file.originalState.cacheFilePath);
        node_fs.unlinkSync(file.acceptedChanges.cacheFilePath);
        if (file.ignoredChanges)
            node_fs.unlinkSync(file.ignoredChanges.cacheFilePath);
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
const exeCommand = (command, onError = () => false) => {
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
    const regex = /[|><&$`"'\(\)\;\\ ]+/g;
    return arg.replace(regex, '');
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

class GitDiffService {
    /**
     * Execute the git diff command with the provided options.
     * @param options Options for the git diff command.
     * @returns The output of the git diff command.
     */
    static async diff(options) {
        const command = this.buildDiffCommand(options);
        return exeCommand(command);
    }
    /**
     * Build the git diff command based on the provided options.
     * @param options Options for the git diff command.
     * @returns The built git diff command.
     */
    static buildDiffCommand(options) {
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
     * @returns An array of GitDiffOutputFile objects, each containing details about a file and its hunks.
     *
     * The function splits the diff output into rows and iterates through them. It creates a new GitDiffOutputFile
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
                const newFile = new GitDiffOutputFile({
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
class GitDiffOutputFile {
    file;
    fileName;
    index;
    aFile;
    bFile;
    hunks;
    acceptedHunks;
    ignoredHunks;
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

class GitServiceFilesReport {
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

class GitService {
    /**
     * Get the user configuration from Git.
     *
     * @returns A promise that resolves with an object containing the user name and email.
     * @throws {GitServiceError} If the command fails.
     */
    static async getUser() {
        const data = await exeCommand('git config user.name && git config user.email');
        const [name, email] = data.split('\n').map(l => l.trim());
        return { name, email, toString: () => `${name} <${email}>` };
    }
    static async setUser(name, email) {
        await exeCommand(`git config user.name "${name}" && git config user.email "${email}"`);
    }
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
        const staged = await GitService.listStagedFiles();
        const unstaged = await GitService.listUnstagedFiles();
        const untracked = await GitService.listUntrackedFiles();
        return new GitServiceFilesReport({ staged, unstaged, untracked });
    }
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

class GitServiceTagger {
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
}

class CommandError extends Error {
    constructor(message) {
        super(message);
    }
}

/**
 * Parses an argument and its value into a structured format.
 *
 * @template A - The type of the argument being parsed.
 * @param arg - The argument object containing metadata such as name, type, and validation rules.
 * @param value - The value associated with the argument, which may be null.
 * @returns A parsed argument object containing the processed value and argument metadata.
 * @throws CommandError - Throws an error if the argument is required but not provided, or if custom validation fails.
 */
const parseArgument = (arg, value) => {
    let { name, required, type, validator } = arg;
    if (required && value === null)
        throw new CommandError(`The option "${name}" is required.`);
    let parsedValue = undefined;
    if (validator) {
        const { error, message = `Error in custom validator for option ${name}` } = validator(value || '');
        if (error)
            throw new CommandError(message);
    }
    parsedValue = parseValueType(type, value);
    const a = {
        name,
        required: required ?? false,
        value: parsedValue,
        type: type,
        validator
    };
    return a;
};
/**
 * Parses a value according to the given option type.
 *
 * @param optionType - The type of the option, which determines how the value is parsed.
 * @param value - The value to parse, which may be null.
 * @returns A parsed value, which may be undefined if the option type is 'string' and the value is null.
 * @throws CommandError - Throws an error if the value given for a 'number' option is not a valid number.
 */
const parseValueType = (optionType, value) => {
    let parsedValue = undefined;
    switch (optionType) {
        case 'string':
            parsedValue = value ?? undefined;
            break;
        case 'number':
            if (value === null)
                return undefined;
            parsedValue = parseFloat(value);
            if (isNaN(parsedValue))
                throw new CommandError('Value given is not number');
            break;
        case 'boolean':
            if (value === null) {
                parsedValue = true;
            }
            else if (value === 'true') {
                parsedValue = true;
            }
            else if (value === 'false') {
                parsedValue = false;
            }
            else {
                parsedValue = true;
            }
            break;
    }
    return parsedValue;
};
/**
 * Generates a new instance of BaseCommand.
 *
 * @param name - The name of the command.
 * @param options - An optional array of command options, each defined by a TOption<TArgumentType>.
 * @param args - An optional array of command arguments, each defined by a TArgumentValue<TArgumentType>.
 * @returns A new BaseCommand instance with the specified name, options, and arguments.
 */
const genCommand = ({ name, args, options }) => {
    return new BaseCommand({ commandName: name, options, arguments: args });
};

/**
 * Returns true if the given argument string is an option, false otherwise.
 *
 * An option is defined as a string that starts with a hyphen and has at least one
 * other character.
 *
 * @param argument - The argument string to check
 * @returns true if the argument is an option, false otherwise
 */
const isOption = (argument) => {
    return argument.length > 1 && argument[0] === '-';
};
/**
 * Determines if the given string is a help flag.
 *
 * Recognizes '--help', '-help', and '-h' as valid help flags.
 *
 * @param v - The string to check
 * @returns true if the string is a help flag, false otherwise
 */
const isHelp = (v) => {
    if (!v)
        return false;
    if (['--help', '-help', '-h'].includes(v))
        return true;
    else
        return false;
};
/**
 * Parses an option string into a key-value pair.
 *
 * @param option - The option string to parse, which may include a key and a value
 * separated by an equal sign or a colon, and may start with one or two hyphens.
 *
 * @returns An object containing the extracted key and value. If the option string
 * does not match the expected pattern, returns an object with both key and value
 * set to null. If the value is not provided in the option string, it defaults to null.
 */
const extractKeyValue = (option) => {
    const match = option.match(/^--?([^=:]+):?=?(.*)?$/);
    if (!match)
        return { key: null, value: null };
    const [, key, value] = match;
    return { key, value: value ?? null };
};
/**
 * Parses an option and its value into a structured format.
 *
 * @template O - The type of the option being parsed.
 * @param option - The option object containing metadata such as name, type, and validation rules.
 * @param value - The value associated with the option, which may be null.
 * @returns A parsed option object containing the processed value and option metadata.
 * @throws CommandError - Throws an error if the option is required but not provided, or if custom validation fails.
 */
const parseOption = (option, value) => {
    let { flag, name, optionType, alias, required, defaultValue, customTransformer, customValidator } = option;
    let parsedValue = undefined;
    if (required && value === null)
        throw new CommandError(`The option "${name}" is required.`);
    if (customValidator) {
        const { error, message = `Error in custom validator for option ${name}` } = customValidator(value || '');
        if (error)
            throw new CommandError(message);
    }
    if (customTransformer)
        parsedValue = customTransformer(value);
    else {
        parsedValue = parseValueType(optionType, value);
    }
    if (defaultValue !== undefined && parsedValue === undefined)
        parsedValue = defaultValue;
    return {
        optionType,
        required: required ?? false,
        alias: alias ?? [],
        flag,
        value: parsedValue,
        name
    };
};

class BaseCommand {
    _commandName;
    _description;
    _options;
    _arguments;
    _action;
    constructor({ commandName, description, arguments: args = [], options = [] }, action = () => void 0) {
        this._commandName = commandName;
        this._description = description;
        this._options = options;
        this._action = action;
        this._arguments = args;
    }
    async parseArguments(args) {
        const remainingArgs = args.slice();
        const parsedOptions = [];
        const parsedArguments = [];
        if (isHelp(remainingArgs[0])) {
            console.log(this.help);
            return;
        }
        let argumentCount = 0;
        while (remainingArgs.length) {
            const argument = remainingArgs.shift();
            if (!argument || argument === '--')
                break;
            let option = null;
            if (isOption(argument))
                option = this._findOption(argument);
            if (option) {
                let { value } = extractKeyValue(argument);
                if (!value && option.optionType !== 'boolean')
                    value = remainingArgs.shift() ?? null;
                parsedOptions.push(parseOption(option, value));
            }
            else if (!isOption(argument)) {
                const arg = this._arguments[argumentCount];
                if (!arg)
                    continue;
                parsedArguments.push(parseArgument(arg, argument));
                argumentCount++;
            }
        }
        for (const element of this._options) {
            const found = parsedOptions.some(a => a.name === element.name);
            if (!found && element.required)
                throw new CommandError(`${element.name} is not provided`);
            if (!found && element.defaultValue !== undefined)
                switch (element.optionType) {
                    case 'string':
                        parsedOptions.push({
                            ...element,
                            value: element.defaultValue
                        });
                        break;
                    case 'number':
                        parsedOptions.push({
                            ...element,
                            value: element.defaultValue
                        });
                        break;
                    case 'boolean':
                        parsedOptions.push({
                            ...element,
                            value: element.defaultValue
                        });
                        break;
                }
            else if (!found && element.optionType === 'boolean')
                parsedOptions.push({
                    ...element,
                    value: false
                });
        }
        for (const element of this._arguments) {
            const found = parsedArguments.some(a => a.name === element.name);
            if (!found && element.required)
                throw new CommandError(`${element.name} is not provided`);
        }
        const o = parsedOptions
            .map(o => ({ [o.name]: o.value }))
            .reduce((acc, curr) => ({ ...acc, ...curr }), {});
        const a = parsedArguments
            .map(o => ({ [o.name]: o.value }))
            .reduce((acc, curr) => ({ ...acc, ...curr }), {});
        await this._action(o, a);
    }
    _findOption(argument) {
        const { key } = extractKeyValue(argument);
        if (!key)
            return null;
        return (this._options.find(option => {
            return (extractKeyValue(option.flag).key === key ||
                option.alias?.some(alias => extractKeyValue(alias).key === key));
        }) ?? null);
    }
    action(fn) {
        this._action = fn;
        return this;
    }
    get name() {
        return this._commandName;
    }
    get help() {
        return (`${this._commandName} [options] [arguments]\n\n` +
            ` ${this._description ?? 'No description available for this command'}\n\n` +
            ' Options:\n' +
            `${this._options
                .map(o => '   ' +
                o.flag +
                ' ' +
                o.alias?.join(' ') +
                '    ' +
                (o.description
                    ? o.description.toUpperCase()
                    : (o.required ? 'required' : 'optional') + ' ' + o.optionType) +
                '\n')
                .join('')}\n\n` +
            (this._arguments.length > 0 ? ` Arguments:\n` : '') +
            `${this._arguments.map(a => `   <${a.name}>    ${a.description ? a.description.toUpperCase() : (a.required ? ' required' : ' optional') + ' ' + a.type}`).join('\n')}`);
    }
}

class Termify {
    _commands;
    _appName;
    _version;
    constructor({ commands, appName, version }) {
        this._commands = commands;
        this._appName = appName;
        this._version = version;
    }
    /**
     * Starts the CLI by parsing the arguments and executing the corresponding command.
     *
     * @throws {CommandError} If the command name does not exists.
     */
    async start(rawArgs) {
        const args = rawArgs?.split(' ') ?? process.argv.slice(2);
        const commandName = args.shift();
        if (commandName && isHelp(commandName)) {
            console.log(this._getHelp());
            return;
        }
        const command = this._commands.find(c => c.name === commandName);
        if (!command)
            throw new CommandError(`Command name: '${commandName}' does not exists`);
        await command.parseArguments(args);
    }
    _getHelp() {
        return `Usage: ${this._appName} <command> [options] [arguments]\n\nCommands:\n${this._commands.map(c => c.help).join('\n\n\n')}`;
    }
}

const createCustomInterface = (fn) => {
    const rl = readline$1.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    readline$1.emitKeypressEvents(process.stdin, rl);
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    }
    const handler = (_, key) => {
        //throw new Error("Not implemented");
        fn(key);
    };
    process.stdin.on('keypress', handler);
    const close = () => {
        rl.close();
        process.stdin.off('keypress', handler);
    };
    return { rl, close };
};
const clearLastLine = () => {
    readline$1.cursorTo(process.stdout, 0);
    readline$1.clearScreenDown(process.stdout);
};

// import chalk from 'chalk';
const confirm = (message) => {
    let accept = false;
    let first = true;
    const showMessage = () => {
        if (first)
            first = false;
        else
            clearLastLine();
        process.stdout.write(
        // `${message}: ` + (accept ? `${chalk.blueBright('> yes')} /   no ` : `  yes / ${chalk.blueBright('> no')}`)
        `${message}: ` + (accept ? `> yes /   no ` : `  yes / > no`));
    };
    return new Promise((resolve, reject) => {
        showMessage();
        try {
            const { close } = createCustomInterface(async (key) => {
                if (key.name === 'return') {
                    close();
                    resolve(accept);
                }
                else if (key.name === 'left' || key.name === 'right') {
                    accept = !accept;
                    showMessage();
                }
                else
                    showMessage();
            });
        }
        catch (error) {
            reject(error);
        }
    });
};

async function question({ message, ...config }) {
    const readlineInterface = promises.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const answer = await readlineInterface.question(`${message} `);
    readlineInterface.close();
    if (config.maxLength && answer.length > config.maxLength) {
        throw new Error(`Answer too long, it needs to be at most ${config.maxLength}`);
    }
    if (config.minLength && answer.length < config.minLength) {
        throw new Error(`Answer too short, it needs to be at least ${config.minLength}`);
    }
    if (config.validate && !config.validate(answer)) {
        throw new Error('Validator rejeted the answer');
    }
    if (config.regexp && !config.regexp.expression.test(answer)) {
        throw new Error(config.regexp.message);
    }
    return answer;
}

async function select({ message, choices }) {
    const rl = readline__namespace.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    let first = true;
    // Make the stdin emit keypress events, otherwise it won't emit them
    readline__namespace.emitKeypressEvents(process.stdin, rl);
    // `process.stdin.isTTY` is true if the stdin is a terminal
    if (process.stdin.isTTY) {
        // set the terminal in raw mode, so that we can capture the input for all keys
        process.stdin.setRawMode(true);
    }
    let selectedChoiceIndex = 0;
    const displayChoices = () => {
        if (!first) {
            readline__namespace.moveCursor(process.stdout, 0, -1 * choices.length - 1); // Mueve el cursor a la última línea
            readline__namespace.clearLine(process.stdout, 0); // Borra la línea
        }
        else {
            first = false;
        }
        console.log(message);
        choices.forEach((choice, index) => {
            if (index === selectedChoiceIndex) {
                // console.log(chalk.blueBright(`> ${choice.name}`));
                console.log(`> ${choice.name}`);
            }
            else {
                console.log(`  ${choice.name}`);
            }
        });
    };
    // Initial display
    displayChoices();
    return new Promise((resolve, reject) => {
        try {
            const keypressHandler = (_, key) => {
                if (key.name === 'up') {
                    selectedChoiceIndex = selectedChoiceIndex === 0 ? choices.length - 1 : selectedChoiceIndex - 1;
                    displayChoices();
                }
                else if (key.name === 'down') {
                    selectedChoiceIndex = selectedChoiceIndex === choices.length - 1 ? 0 : selectedChoiceIndex + 1;
                    displayChoices();
                }
                else if (key.name === 'return') {
                    resolve(choices[selectedChoiceIndex]);
                    process.stdin.off('keypress', keypressHandler);
                    if (process.stdin.isTTY) {
                        process.stdin.setRawMode(false);
                    }
                    rl.close();
                }
            };
            process.stdin.on('keypress', keypressHandler);
        }
        catch (error) {
            reject(error);
        }
    });
}

const diffPickCommand = genCommand({
    name: 'add-diff',
    args: [],
    options: [
        {
            alias: ['-f'],
            optionType: 'string',
            name: 'file',
            flag: '--file'
        }
    ]
});
diffPickCommand.action(async ({ file }) => {
    const diff = await GitDiffService.parseGitDiffOutput({ file });
    if (diff.length === 0)
        ErrorHandler.throw(new AppError(`No diff found for '${file}'.`));
    for (const fileDiff of diff) {
        console.log(`In file ${fileDiff.file}`);
        console.log(fileDiff.aFile);
        console.log(fileDiff.bFile + '\n');
        for (const hunk of fileDiff.hunks) {
            console.log(hunk);
            const answer = await confirm('Add this hunk?');
            if (answer)
                fileDiff.acceptedHunks.push(hunk);
            else
                fileDiff.ignoredHunks.push(hunk);
        }
        if (fileDiff.acceptedHunks.length === 0)
            continue;
        const cache = new CacheStore();
        const file = cache.getFileCache(cache.createPatchCache({
            acceptedDiff: fileDiff.getAcceptedDiffPatch(),
            filePath: fileDiff.file,
            originalDiff: fileDiff.getTotalDiffPatch(),
            ignoredDiff: fileDiff.getIgnoredDiffPatch() ?? undefined
        }));
        await exeCommand(`git checkout ${fileDiff.fileName}`);
        await exeCommand(`git apply ${file.acceptedChanges.cacheFilePath}`, async () => {
            await exeCommand(`git apply ${file.originalState.cacheFilePath}`);
            return true;
        });
        await exeCommand(`git add ${fileDiff.fileName}`);
        if (file.ignoredChanges)
            await exeCommand(`git apply ${file.ignoredChanges.cacheFilePath}`);
        cache.clearFileCache(file.hash);
    }
});

const changelogCommand = genCommand({
    name: 'changelog',
    options: [
        {
            name: 'from',
            flag: '-f',
            alias: ['--from'],
            optionType: 'string'
        },
        {
            name: 'to',
            flag: '-t',
            alias: ['--to'],
            optionType: 'string'
        },
        {
            name: 'branch',
            flag: '-b',
            alias: ['--branch'],
            optionType: 'string'
        }
    ],
    args: [
        {
            name: 'outputFile',
            type: 'string',
            required: true
        }
    ]
});
changelogCommand.action(async ({ from, to, branch }, { outputFile }) => {
    const commits = await GitService.log({ to, from, branch });
    ChangeLogService.generateChangelog({ commits, version: '1.0.0', outputFile });
    console.log(`New release notes in: ${outputFile ?? 'changelog.md'}`);
});

const COMMIT_STANDARD_TYPES = [
    {
        icon: '🚀',
        name: 'feat',
        description: 'Agregar una nueva funcionalidad o característica al proyecto.'
    },
    { icon: '🐛', name: 'fix', value: 'fix', description: 'Corregir un error o bug en el código.' },
    {
        icon: '📚',
        name: 'docs',
        description: 'Actualizar o modificar la documentación del proyecto (README, comentarios, etc.).'
    },
    {
        icon: '🎨',
        name: 'style',
        description: 'Cambios en el formato o estilo del código, sin afectar la funcionalidad.'
    },
    {
        icon: '♻️ ',
        name: 'refactor',
        description: 'Reestructuración del código para mejorar su calidad o rendimiento, sin cambiar su comportamiento.'
    },
    {
        icon: '⚡',
        name: 'performance',
        description: 'Mejoras en el rendimiento del proyecto sin afectar su funcionalidad.'
    },
    {
        icon: '🧪',
        name: 'test',
        description: 'Añadir o modificar pruebas (unitarias, de integración) para mejorar la cobertura del código.'
    },
    {
        icon: '🧹',
        name: 'chore',
        description: 'Tareas de mantenimiento, configuración o administración, que no afectan la funcionalidad del proyecto.'
    },
    {
        icon: '🏗️ ',
        name: 'build',
        description: 'Cambios relacionados con la construcción del proyecto, como dependencias, compilación o configuración.'
    },
    {
        icon: '⚙️ ',
        name: 'ci',
        description: 'Cambios en la configuración de integración continua o en los pipelines de CI/CD.'
    },
    {
        icon: '🚀',
        name: 'release',
        description: 'Realizar un lanzamiento o actualización de la versión del proyecto.'
    },
    {
        icon: '❌',
        name: 'removed',
        description: 'Eliminar funcionalidades obsoletas o innecesarias.'
    },
    {
        icon: '📉',
        name: 'deprecated',
        description: 'Marcar funcionalidades como obsoletas y que serán eliminadas en el futuro.'
    },
    {
        icon: '🔒',
        name: 'security',
        description: 'Cambios relacionados con la seguridad, como actualizaciones para mitigar vulnerabilidades.'
    },
    { icon: '⏪', name: 'revert', value: 'revert', description: 'Deshacer cambios realizados en un commit anterior.' },
    {
        icon: '⚒️ ',
        name: 'wip',
        description: 'Trabajo en progreso, commit incompleto que refleja cambios aún en desarrollo.'
    }
];

const commitCommand = genCommand({
    name: 'commit',
    args: [],
    options: [
        {
            name: 'type',
            optionType: 'string',
            flag: '-t',
            alias: ['--type'],
            required: false,
            customValidator: n => {
                if (!COMMIT_STANDARD_TYPES.map(t => t.name).includes(n))
                    return {
                        error: true,
                        message: `${n} is not a valid standard commit type. Valid types are ${COMMIT_STANDARD_TYPES.map(t => t.name).join(', ')}`
                    };
                else
                    return { error: false };
            }
        },
        {
            name: 'title',
            optionType: 'string',
            flag: '-m',
            alias: ['--title'],
            required: false
        },
        {
            name: 'body',
            optionType: 'string',
            flag: '-b',
            alias: ['--message'],
            required: false
        },
        {
            name: 'ammend',
            optionType: 'boolean',
            flag: '-a',
            alias: ['--ammend'],
            required: false,
            defaultValue: false
        }
    ]
});
commitCommand.action(async ({ body, title, type, ammend }) => {
    const report = await GitService.filesReport();
    if (report.stagedReport() === '') {
        ErrorHandler.throw(new AppError("There are no files staged for commit, first add some.\nIt appears that you haven't added any files to the staging area. Please use git add <file> to stage your changes before committing."));
    }
    let target = '';
    if (!type)
        try {
            type = (await select({
                choices: COMMIT_STANDARD_TYPES.map(t => ({
                    name: `${t.icon} ${t.name}`,
                    value: t.name,
                    description: t.description
                })),
                message: 'Select type: '
            })).value;
        }
        catch (error) {
            ErrorHandler.throw(new ExternalServiceError('Error obtaining commit info bia cly', 'askly'));
        }
    target = await question({ message: 'Target: ' });
    if (!title)
        title = await question({ message: 'Title: ' });
    if (!body)
        body = await question({ message: 'Body: ' });
    if (ammend)
        ammend = (await confirm('Ammend commit?'));
    target = target ? `(${target})` : target;
    const author = await GitService.getUser();
    console.log('\nauthor: ', author.toString());
    console.log('type: ', type);
    console.log('title: ', title);
    console.log('body: ', body);
    console.log('\n', report.stagedReport());
    if (await confirm('Is this correct?')) {
        console.log('\nCommitting...');
        const command = `git commit ${ammend ? '--amend' : ''} -m "${type}${target}: ${title}\n\n${body}"`;
        const result = await exeCommand(command);
        console.log('result:');
        console.log(result);
    }
    else {
        console.log('\nAborting...');
        process.exit(1);
    }
});

const configUserCommand = genCommand({
    name: 'config-user',
    options: [
        {
            name: 'name',
            optionType: 'string',
            flag: '-n',
            alias: ['--name'],
            required: false
        },
        {
            name: 'email',
            optionType: 'string',
            flag: '-e',
            alias: ['--email'],
            required: false
        }
    ],
    args: []
});
configUserCommand.action(async ({ name, email }) => {
    if (!name)
        name = await question({ message: 'User name: ' });
    if (!email)
        email = await question({ message: 'User email: ' });
    console.log('\nIs this correct?');
    console.log('name: ', name);
    console.log('email: ', email);
    if (await confirm('Is this correct?')) {
        console.log('\Updating user configuration...');
        try {
            await GitService.setUser(name, email);
        }
        catch (error) {
            ErrorHandler.throw(new GitServiceError('Error updating user configuration', 'setting user'));
        }
    }
    else {
        console.log('\nAborting...');
        process.exit(1);
    }
});

const validTargets = ['staged', 'unstaged', 'untracked'];
const reportCommand = genCommand({
    name: 'report',
    options: [
        {
            flag: '-t',
            name: 'target',
            optionType: 'string',
            required: false,
            alias: ['--target'],
            customValidator: value => {
                if (!validTargets.includes(value))
                    return {
                        error: true,
                        message: `Invalid value for target: ${value}`
                    };
                else
                    return { error: false };
            }
        }
    ],
    args: []
});
reportCommand.action(async ({ target }) => {
    const files = await GitService.filesReport();
    switch (target) {
        case 'staged':
            console.log(files.stagedReport());
            break;
        case 'unstaged':
            console.log(files.unstagedReport());
            break;
        case 'untracked':
            console.log(files.untrackedReport());
            break;
        default:
            console.log(files.totalReport());
    }
});

const tagCommand = genCommand({
    name: 'tag',
    options: [
        {
            name: 'tagName',
            flag: '-a',
            alias: ['--add'],
            optionType: 'string',
            required: false
        },
        {
            name: 'message',
            flag: '-m',
            alias: ['--message'],
            optionType: 'string',
            required: false
        },
        {
            name: 'remove',
            flag: '-d',
            alias: ['--remove', '--delete'],
            optionType: 'string',
            required: false
        },
        {
            name: 'remote',
            flag: '-r',
            alias: ['--remote'],
            optionType: 'string',
            required: false
        },
        { name: 'listLocal', flag: '-ll', alias: ['--list-local'], optionType: 'boolean', required: false },
        { name: 'listRemote', flag: '-lr', alias: ['--list-remote'], optionType: 'boolean', required: false },
        { name: 'list', flag: '-l', alias: ['--list'], optionType: 'boolean', required: false }
    ]
});
tagCommand.action(async ({ tagName, message, remove, remote, list, listLocal, listRemote }) => {
    const optionsList = [
        ...[
            { name: 'add', value: tagName },
            { name: 'remove', value: remove }
        ].filter(({ value: v }) => typeof v === 'string'),
        ...[
            { name: 'list', value: list },
            { name: 'listLocal', value: listLocal },
            { name: 'listRemote', value: listRemote }
        ].filter(({ value: v }) => v === true)
    ];
    if (optionsList.length > 1)
        ErrorHandler.throw(new AppError(`\n > Error: The options "${optionsList.map(item => item.name).join(', ')}" provided are incompatible.\n` +
            `   Please check the command and ensure that the options you are using do not conflict with each other. For more information, use the '--help' flag.\n`));
    let res = '';
    const localTags = await GitServiceTagger.listTagsLocal();
    const remoteTags = await GitServiceTagger.listTagsRemote();
    const existTag = localTags.find(({ tag }) => tag === tagName);
    switch (optionsList[0].name) {
        case 'add': {
            if (!message && !existTag)
                res = await GitServiceTagger.createLightweightTag(tagName).then(() => `\n > 'New light tag added!: ${tagName}'\n`);
            else if (message && !existTag)
                res = await GitServiceTagger.createAnnotatedTag({ name: tagName, message }).then(() => `\n > 'New annotated tag added!: ${tagName}'\n`);
            if (remote) {
                if (existTag)
                    console.warn(`\n > Tag ${tagName} already exists locally at ${existTag.commit}, trying to push ${remote}!`);
                console.log(`\n > Pushing tag to remote ${remote}...`);
                res += `\n > Remote ${remote}:\n   ${await GitServiceTagger.pushTag(tagName)}\n\n`;
            }
            break;
        }
        case 'remove': {
            if (!existTag)
                console.warn(`\n > Tag ${remove} does not exist locally!`);
            else
                res = 'Tag removed!: ' + (await GitServiceTagger.deleteTag(remove));
            if (remote) {
                console.log(`\n > Pushing changes to remote ${remote}...`);
                const commandRes = await GitServiceTagger.deleteRemoteTag(remove, remote);
                res += `Tag removed from '${remote}'!: ${commandRes}`;
            }
        }
        case 'list': {
            res = ' > Local tags:\n' + localTags.map(({ tag, commit }) => ` * ${commit} ${tag}`).join('\n') + '\n\n';
            res += ' > Remote tags:\n' + remoteTags.map(({ tag, commit }) => ` * ${commit} ${tag}`).join('\n');
            break;
        }
        case 'listLocal': {
            res = 'Local tags:\n' + localTags.map(({ tag, commit }) => ` * ${commit} ${tag}`).join('\n');
            break;
        }
        case 'listRemote': {
            res = 'Remote tags:\n' + remoteTags.map(({ tag, commit }) => ` * ${commit} ${tag}`).join('\n');
            break;
        }
    }
    console.log(res);
});

const commands = [commitCommand, diffPickCommand, configUserCommand, reportCommand, tagCommand, changelogCommand];

const run = async () => {
    ErrorHandler.subscribe(error => {
        console.error(`\n[${error.VERSION_NAME}]: ${error.message}`);
        if (error instanceof AppError && (IS_DEV || IS_TEST))
            console.log(`Error ocurred during script execution at:\n${error.errorTrack}\n`);
        process.exit(1);
    });
    await new Termify({ appName: 'taskgit', commands, version: AppError.VERSION }).start();
};
run();
