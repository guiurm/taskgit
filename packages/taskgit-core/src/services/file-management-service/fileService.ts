import { createHash } from 'crypto';
import {
    copyFileSync,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    renameSync,
    rmSync,
    Stats,
    statSync,
    unlinkSync,
    writeFileSync
} from 'node:fs';
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

/**
 * Moves a file or directory from a source path to a destination path.
 * If the source is a directory, recursively copies all its contents to the destination.
 * If the source is a file, copies it directly to the destination.
 *
 * @param {string} from - The source path of the file or directory to move.
 * @param {string} to - The destination path where the file or directory should be moved.
 * @param {boolean} [returnErrorList=false] - If true, instead of throwing errors, returns an array of objects with the following structure: {from: string, to: string, message: string}, where "from" and "to" are the paths of the file or directory that couldn't be moved, and "message" is the error string.
 * @returns {void | { from: string; to: string; message: string }[]} - If returnErrorList is false, returns void. Otherwise returns an array of the above objects.
 */
const mv = (
    from: string,
    to: string,
    returnErrorList: boolean = false
): void | { from: string; to: string; message: string }[] => {
    const failed: { from: string; to: string; message: string }[] = [];
    if (existsSync(from))
        if (isDirectory(from)) {
            mkdirSync(to, { recursive: true });
            readdirSync(from).forEach(f => {
                failed.push(...(mv(join(from, f), join(to, f)) ?? []));
            });
        } else {
            try {
                cp(from, to);
            } catch (error) {
                const e = error as FileServiceError;
                if (returnErrorList) failed.push({ from, to, message: (error as FileServiceError).message });
                else throw e;
            }
        }
    else failed.push({ from, to, message: `The file at '${from}' does not exist.` });

    if (returnErrorList) return failed;
    else return void 0;
};

/**
 * Removes a directory at the specified path.
 *
 * @param {string} path - The path to the directory to be removed.
 * @param {boolean} [returnErrorList=false] - If true, returns an array of error objects instead of throwing an error.
 * @returns {void | { path: string; message: string }[]} - Returns void if `returnErrorList` is false.
 * If `returnErrorList` is true, returns an array of objects containing the path and error message for each error encountered.
 *
 * @throws {FileServiceError} If an error occurs during the removal process, unless `returnErrorList` is true.
 */
const rmdir = (path: string, returnErrorList: boolean = false): void | { path: string; message: string }[] => {
    const failed: { path: string; message: string }[] = [];
    if (existsSync(path))
        if (isDirectory(path)) {
            try {
                rmSync(path, { recursive: true, force: true });
                // rmdirSync(path, { recursive: true, maxRetries: 10 });
            } catch (error) {
                if (returnErrorList) failed.push({ path, message: (error as FileServiceError).message });
                else throw error;
            }
        } else {
            failed.push({ path, message: `The path '${path}' is not a directory.` });
        }
    else failed.push({ path, message: `The file at '${path}' does not exist.` });

    if (returnErrorList) return failed;
    else return void 0;
};

/**
 * Removes a file or directory at the specified path.
 *
 * If the path is a directory, it recursively deletes all its contents.
 * If the path is a file, it deletes the file.
 *
 * @param {string} path - The path to the file or directory to be removed.
 * @param {boolean} [returnErrorList=false] - If true, returns an array of error objects instead of throwing an error.
 * @returns {void | { path: string; message: string }[]} - Returns void if `returnErrorList` is false.
 * If `returnErrorList` is true, returns an array of objects containing the path and error message for each error encountered.
 *
 * @throws {FileServiceError} If an error occurs during the removal process, unless `returnErrorList` is true.
 */

const rm = (path: string, returnErrorList: boolean = false): void | { path: string; message: string }[] => {
    const failed: { path: string; message: string }[] = [];
    if (existsSync(path))
        if (isDirectory(path)) {
            readdirSync(path).forEach(f => {
                failed.push(...(rm(join(path, f)) ?? []));
            });
            try {
                rmSync(path, { recursive: true, force: true });
                // rmdirSync(path);
            } catch (error) {
                if (returnErrorList) failed.push({ path, message: (error as FileServiceError).message });
                else throw error;
            }
        } else {
            try {
                unlinkSync(path);
            } catch (error) {
                const e = error as FileServiceError;
                if (returnErrorList) failed.push({ path, message: (error as FileServiceError).message });
                else throw e;
            }
        }
    else failed.push({ path, message: `The file at '${path}' does not exist.` });

    if (returnErrorList) return failed;
    else return void 0;
};

/**
 * Copies a file from a source path to a destination path.
 *
 * @param {string} from - The source path of the file to copy.
 * @param {string} to - The destination path where the file should be copied.
 * @throws {FileServiceError} If the source file does not exist or if the source path is a directory.
 */
const cp = (from: string, to: string): void => {
    if (existsSync(from))
        if (isDirectory(from)) throw new FileServiceError(`The path is '${from}' is a directory.`, from, 'read');
        else
            try {
                copyFileSync(from, to);
            } catch (error) {
                throw new FileServiceError((error as Error).message, from, 'write');
            }
    else throw new FileServiceError(`The file at '${from}' does not exist.`, from, 'read');
};

export {
    cp,
    createDirPath,
    createFileHash,
    existsPath,
    FileServiceError,
    getFileStat,
    isDirectory,
    isFile,
    mf,
    mv,
    resolvePath,
    rf,
    rm,
    rmdir,
    sha1,
    wf
};
