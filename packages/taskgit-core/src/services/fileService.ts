import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, Stats, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'path';

class FileServiceError extends Error {
    public readonly file: string;
    public readonly action: 'read' | 'write' | 'delete';

    constructor(message: string, file: string, action: 'read' | 'write' | 'delete') {
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
const sha1 = (content?: string): string => {
    const hash = createHash('sha1');
    if (content) hash.update(content);
    return hash.digest('hex');
};

/**
 * Reads the content of a file at the given path.
 * @param {string} path - The path to the file to be read.
 * @returns {string} The content of the file as a UTF-8 encoded string.
 * @throws {FileServiceError} If an error occurs while reading the file.
 */
const rf = (path: string): string => {
    try {
        return readFileSync(path, { encoding: 'utf-8' });
    } catch (error) {
        const err = new FileServiceError((error as Error).message, path, 'read');
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
const wf = (path: string, data: string) => {
    try {
        writeFileSync(path, data, { encoding: 'utf-8' });
    } catch (error) {
        const err = new FileServiceError((error as Error).message, path, 'read');
        // ErrorHandler.throw(err);
        throw err;
    }
};

/**
 * Creates a SHA1 hash of a given file.
 * @param {string} filePath - The content of the file to hash.
 * @returns {string} The SHA1 hash of the given file.
 */
const createFileHash = (filePath: string): string => {
    const hash = createHash('sha1');
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
const resolvePath = (path: string, cwd: string = process.cwd()): string => {
    if (path.startsWith(cwd)) return join(path, '');
    return join(cwd, path);
};

/**
 * Checks if a file or directory exists at the specified path.
 *
 * @param {string} path - The path to check for existence.
 * @returns {boolean} True if the path exists, false otherwise.
 */
const existsPath = (path: string): boolean => {
    return existsSync(resolvePath(path));
};

/**
 * Creates the directory path if it does not exist.
 *
 * @param {string} path - The path to the directory to be created.
 * @returns {void}
 */
const createDirPath = (path: string) => {
    if (existsPath(path)) return;
    mkdirSync(dirname(path), { recursive: true });
};

/**
 * Moves a file from the origin path to the destination path.
 * @param {string} originPath - The path to the file to be moved.
 * @param {string} destinationPath - The path where the file should be moved to.
 * @param {string} [cwd=process.cwd()] - The current working directory. Defaults to the process's cwd.
 * @throws {FileServiceError} If the file does not exist at the given path.
 */
const mf = (originPath: string, destinationPath: string, cwd: string = process.cwd()): void => {
    const parsedOriginRoute = resolvePath(originPath, cwd);
    const parsedDestinationRoute = resolvePath(destinationPath, cwd);

    if (!existsPath(parsedOriginRoute)) {
        const error = new FileServiceError(
            `The file at '${parsedOriginRoute}' does not exist.`,
            parsedOriginRoute,
            'read'
        );
        // ErrorHandler.throw(error);
        throw error;
    }

    createDirPath(parsedDestinationRoute);

    // const destinationDirName = dirname(parsedDestinationRoute);
    // if (!existsPath(destinationDirName)) mkdirSync(destinationDirName, { recursive: true });

    renameSync(parsedOriginRoute, parsedDestinationRoute);
};

/**
 * Gets the stats of a file at the given path.
 *
 * @param {string} path - The path to the file to get the stats from.
 * @returns {import("node:fs").Stats} The stats of the file.
 * @throws {FileServiceError} If the file does not exist at the given path.
 */
const getFileStat = (path: string): Stats => {
    if (!existsPath(path)) {
        const error = new FileServiceError(`The file at '${path}' does not exist.`, path, 'read');
        // ErrorHandler.throw(error);
        throw error;
    }

    try {
        return statSync(path);
    } catch (error) {
        const err = new FileServiceError((error as Error).message, path, 'read');
        // ErrorHandler.throw(err);
        throw err;
    }
};

/**
 * Checks if the given path is a file.
 * @param {string} path - The path to check.
 * @returns {boolean} True if the path is a file, false otherwise.
 */
const isFile = (path: string): boolean => {
    try {
        return getFileStat(path)?.isFile();
    } catch (error) {
        return false;
    }
};

/**
 * Checks if the given path is a directory.
 * @param {string} path - The path to check.
 * @returns {boolean} True if the path is a directory, false otherwise.
 */
const isDirectory = (path: string): boolean => {
    try {
        return getFileStat(path)?.isDirectory();
    } catch (error) {
        return false;
    }
};

export {
    createDirPath,
    createFileHash,
    existsPath,
    FileServiceError,
    getFileStat,
    isDirectory,
    isFile,
    mf,
    resolvePath,
    rf,
    sha1,
    wf
};
