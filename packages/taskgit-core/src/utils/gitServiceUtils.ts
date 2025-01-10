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
    command = escapeShellArg(command);

    if (!isValidFilename(command)) ErrorHandler.throw(new GitServiceError('Invalid command', command));

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
 * Escape a string to be used as an argument in a shell command.
 * This function escapes double quotes, single quotes, and backslashes,
 * and also escapes any dollar signs by prefixing them with a backslash.
 * @param arg The string to escape.
 * @returns The escaped string.
 */
const escapeShellArg = (arg: string): string => {
    return arg.replace(/(["'\\])/g, '\\$1').replace(/\$/g, '\\$');
};

/**
 * Verifica si un nombre de archivo es válido.
 * Un nombre de archivo es válido si solo contiene letras, números, guiones, guiones bajos y puntos.
 * @param filename El nombre de archivo a verificar.
 * @returns `true` si el nombre de archivo es válido, `false` en caso contrario.
 */
const isValidFilename = (filename: string): boolean => {
    const regex = /^[a-zA-Z0-9_\-\.]+$/; // Solo permite letras, números, guiones, guiones bajos y puntos
    return regex.test(filename);
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
