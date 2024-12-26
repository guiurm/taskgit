import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { ErrorHandler, FileServiceError } from '../error-handler';

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
        ErrorHandler.throw(new FileServiceError((error as Error).message, path, 'read'));
        return '';
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
        ErrorHandler.throw(new FileServiceError((error as Error).message, path, 'read'));
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
 * Generates a SHA1 hash for the given content.
 * @param {string} [content] - The content to hash. If not provided, an empty hash is returned.
 * @returns {string} The SHA1 hash of the content.
 */
const sha1 = (content?: string): string => {
    const hash = createHash('sha1');
    if (content) hash.update(content);
    return hash.digest('hex');
};

export { createFileHash, rf, sha1, wf };
