'use strict';

var node_os = require('node:os');
var node_path = require('node:path');
var node_url = require('node:url');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var node_fs = require('node:fs');
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
        return fs.readFileSync(path, { encoding: 'utf-8' });
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
        fs.writeFileSync(path, data, { encoding: 'utf-8' });
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
    return fs.existsSync(resolvePath(path));
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
    fs.mkdirSync(path.dirname(path$1), { recursive: true });
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
    fs.renameSync(parsedOriginRoute, parsedDestinationRoute);
};
/**
 * Gets the stats of a file at the given path.
 *
 * @param {string} path - The path to the file to get the stats from.
 * @returns {import("fs").Stats} The stats of the file.
 * @throws {FileServiceError} If the file does not exist at the given path.
 */
const getFileStat = (path) => {
    if (!existsPath(path)) {
        const error = new FileServiceError(`The file at '${path}' does not exist.`, path, 'read');
        // ErrorHandler.throw(error);
        throw error;
    }
    try {
        return fs.statSync(path);
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
const IS_DEV = process.env.NODE_ENV !== 'production';
const IS_TEST = process.env.NODE_ENV === 'test';
const LOG_SPLITTER = '_$ ò $_';
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
        this._subscriber.forEach(s => s(error));
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
 * Execute a command in the shell and return the result as a promise.
 *
 * @param command The command to execute.
 * @returns A promise that resolves with the result of the command execution.
 * @throws {GitServiceError} If the command fails.
 */
const exeCommand = (command, onError = () => { }) => {
    return new Promise(resolve => {
        node_child_process.exec(command, async (error, stdout, _stderr) => {
            if (error) {
                const e = new GitServiceError(_stderr, command);
                await onError(e);
                ErrorHandler.throw(e);
            }
            resolve(stdout);
        });
    });
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
        return ` * ${tag} > ${commit}`;
    })
        .join('\n');
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
    static async createAnnotatedTag({ message, name }) {
        let command = `git tag -a ${name}`;
        if (message)
            command += ` -m "${message}"`;
        return await exeCommand(command);
    }
    static async createLightweightTag(name) {
        return await exeCommand(`git tag ${name}`);
    }
    static async deleteTag(name) {
        return await exeCommand(`git tag -d ${name}`);
    }
    static async pushTag(name) {
        return await exeCommand(`git push origin ${name}`);
    }
    static async deleteRemoteTag(name, remote = 'origin') {
        return await exeCommand(`git push --delete ${remote} ${name}`);
    }
    static async listTagsLocal() {
        const list = parseTagsList(await exeCommand('git show-ref --tags'));
        return list.length === 0 ? undefined : list;
    }
    static async listTagsNamesLocal() {
        return (await exeCommand('git tag')).split('\n');
    }
    static async listTagsRemote() {
        const list = parseTagsList(await exeCommand('git ls-remote --tags'));
        return list.length === 0 ? undefined : list;
    }
}

exports.AppError = AppError;
exports.COMMIT_STANDARD_TYPES = COMMIT_STANDARD_TYPES;
exports.CacheStore = CacheStore;
exports.ChangeLogService = ChangeLogService;
exports.ErrorHandler = ErrorHandler;
exports.ExternalServiceError = ExternalServiceError;
exports.FileServiceError = FileServiceError;
exports.GitDiffOutputFile = GitDiffOutputFile;
exports.GitDiffService = GitDiffService;
exports.GitService = GitService;
exports.GitServiceError = GitServiceError;
exports.GitServiceFilesReport = GitServiceFilesReport;
exports.GitServiceTagger = GitServiceTagger;
exports.IS_DEV = IS_DEV;
exports.IS_TEST = IS_TEST;
exports.LOG_SPLITTER = LOG_SPLITTER;
exports.MarkdownService = MarkdownService;
exports.NAME = NAME;
exports.TMP_DIR = TMP_DIR;
exports.TMP_PATCH_DIR = TMP_PATCH_DIR;
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
