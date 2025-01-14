import { AppError, CommandExecutionError, ErrorHandler } from '@services/error-handler';
import { exec } from 'node:child_process';

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
const exeCommand = async (
    command: string | string[],
    onError: (even: CommandExecutionError) => boolean | Promise<boolean> = () => false
) => {
    if (Array.isArray(command)) command = command.map(transformCommandArg).join(' ');
    else {
        const regex = /"[^"]*"|[^ ]+/g;
        const marches = command.match(regex);
        if (marches !== null) command = marches.map(transformCommandArg).join(' ');
        else command = transformCommandArg(command);
    }

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
const isSafeCommandArg = (arg: string): boolean => {
    if (typeof arg !== 'string') return false;
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
const eliminateSpecialCharacters = (arg: string): string => {
    const regex = /[|><&$`"'\(\)\;\\ ]+/g;
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
const transformCommandArg = (arg: string): string => {
    if (typeof arg !== 'string')
        ErrorHandler.throw(
            new AppError(
                'An internal error has occurred. Please review your configuration or consult the documentation.'
            )
        );

    let v = arg
        .split(' ')
        .map(eliminateSpecialCharacters)
        .map(a =>
            isSafeCommandArg(a)
                ? a
                : (ErrorHandler.throw(
                      new AppError(
                          'An internal error has occurred. Please review your configuration or consult the documentation.'
                      )
                  ) ?? '')
        );

    if (v.length > 1) return ['"', v.join(' '), '"'].join('');
    else return v.join('');
};

export { exeCommand };
