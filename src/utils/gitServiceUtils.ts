import { exec } from 'node:child_process';
import { ErrorHandler, GitServiceError } from '../error-handler';
import { TFileListStatus } from '../types';

/**
 * Execute a command in the shell and return the result as a promise.
 *
 * @param command The command to execute.
 * @returns A promise that resolves with the result of the command execution.
 * @throws {GitServiceError} If the command fails.
 */
const exeCommand = (command: string, onError: (even: GitServiceError) => void | Promise<void> = () => {}) => {
    return new Promise<string>(resolve => {
        exec(command, async (error, stdout, _stderr) => {
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
const parseTagsList = (data: string) => {
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
const processFiles = (data: string): TFileListStatus => {
    const files = { added: [] as string[], modified: [] as string[], deleted: [] as string[] };

    data.split('\n')
        .map(line => line.trim())
        .forEach(line => {
            const status = line.charAt(0);
            const file = line.slice(2).trim();

            if (status === 'A') files.added.push(file);
            else if (status === 'M') files.modified.push(file);
            else if (status === 'D') files.deleted.push(file);
        });

    return files;
};

export { exeCommand, parseTagsList, processFiles };
