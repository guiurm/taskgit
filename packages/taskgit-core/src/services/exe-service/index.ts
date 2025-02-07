import { AppError, CommandExecutionError, ErrorHandler } from '@services/error-handler';
import { exec, ExecException, execSync } from 'node:child_process';

/**
 * Checks if a given string is a safe command to execute.
 *
 * This function evaluates whether the input string contains only
 * characters that are considered safe for use in shell commands,
 * i.e., it does not contain any special characters that could
 * alter the behavior of the shell command.
 *
 * @param {string} command The string to evaluate.
 * @param {boolean} iKnowWhatImDoing Whether to bypass the check. Defaults to false.
 * @returns A boolean indicating if the string is safe (true) or not (false).
 */
const isSafeCommand = (command: string, iKnowWhatImDoing: boolean = false) => {
    if (iKnowWhatImDoing) return true;
    if (!command || typeof command !== 'string' || command.length === 0) return false;
    const unsafePattern = /[;&|<>]/;
    return !unsafePattern.test(command);
};

/**
 * Executes a command and returns the result as a promise.
 *
 * @param {string | string[]} command The command to execute. Can be a string or an array of strings.
 * @param {Function} onError A callback that will be called if the command execution fails.
 *                If the callback returns true, the method will throw an error.
 *                If it returns false or nothing, the method will return the error
 *                as a CommandExecutionError. If the callback returns a promise,
 *                the method will wait for the promise to resolve before deciding
 *                what to do.
 * @returns A promise that resolves with the output of the command as a string.
 */
const exeCommand = async (
    command: string,
    onError: (even: CommandExecutionError) => boolean | Promise<boolean> = () => false,
    iKnowWhatImDoing: boolean = false
) => {
    if (!isSafeCommand(command, iKnowWhatImDoing)) ErrorHandler.throw(new AppError('Unsafe command detected.'));

    return new Promise<string>(resolve => {
        exec(command, async (error, stdout, stderr) => {
            const mssg = stdout.length > 0 ? stdout : stderr;
            if (error) {
                const e = new CommandExecutionError({ command, error, message: error.message, stderr, stdout });
                if (await onError(e)) ErrorHandler.throw(e);
            }
            resolve(mssg);
        });
    });
};

/**
 * Executes a given command synchronously and returns the result as a string.
 *
 * @param {string} command - The command to execute.
 * @param {Function} onError - A callback invoked if command execution fails.
 *                             If it returns true, an error is thrown. Otherwise,
 *                             a CommandExecutionError is returned.
 * @param {boolean} iKnowWhatImDoing - Flag to bypass command safety checks. Defaults to false.
 * @returns {string} - The output of the executed command.
 * @throws {AppError} - If the command is deemed unsafe.
 * @throws {CommandExecutionError} - If command execution fails and the onError callback returns false.
 */

const exeCommandSync = (
    command: string,
    onError: (even: CommandExecutionError) => boolean | Promise<boolean> = () => false,
    iKnowWhatImDoing: boolean = false
) => {
    if (!isSafeCommand(command, iKnowWhatImDoing)) ErrorHandler.throw(new AppError('Unsafe command detected.'));

    try {
        return execSync(command).toString();
    } catch (err) {
        const error = err as ExecException;
        const e = new CommandExecutionError({
            command,
            error,
            message: error.message,
            stderr: error.stderr ?? '',
            stdout: error.stdout ?? ''
        });
        if (onError(e)) ErrorHandler.throw(e);
        else throw e;
    }
};

/**
 * Execute multiple commands asynchronously.
 *
 * @param {string[]} commands - Commands to be executed.
 *
 * @returns {Promise<string[]>} - Resolves with an array of strings, where each
 * string is the output of the corresponding command.
 */
const exeMultipleCommands = async (commands: string[]) => {
    return Promise.all(commands.map(c => exeCommand(c)));
};

/**
 * Execute multiple commands synchronously.
 *
 * @param {string[]} commands - Commands to be executed.
 *
 * @returns {string[]} - Results of the commands.
 */
const exeMultipleCommandsSync = (commands: string[]) => {
    return commands.map(c => exeCommandSync(c));
};

export { exeCommand, exeCommandSync, exeMultipleCommands, exeMultipleCommandsSync, isSafeCommand };
