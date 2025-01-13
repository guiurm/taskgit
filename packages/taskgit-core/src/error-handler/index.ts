import { ExecException } from 'node:child_process';
import { NAME, VERSION, VERSION_NAME } from '../globals';

class AppError extends Error {
    public readonly errorTracks: string[];
    public static readonly VERSION = VERSION;
    public static readonly NAME = NAME;
    public static readonly VERSION_NAME = VERSION_NAME;
    public readonly exitCode;

    constructor(message: string, exitCode: number = 1) {
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

    public get errorTrack() {
        return this.errorTracks.map(l => `    ${l}`).join('\n');
    }
    public get lastTrack() {
        return this.errorTracks[0];
    }

    public get VERSION() {
        return AppError.VERSION;
    }
    public get NAME() {
        return AppError.NAME;
    }
    public get VERSION_NAME() {
        return AppError.VERSION_NAME;
    }
}

class GitServiceError extends AppError {
    public readonly command: string;

    constructor(message: string, command: string) {
        super(message, 2);
        this.name = 'GitServiceError';
        this.command = command;
    }
}

class ExternalServiceError extends AppError {
    public readonly service: string;

    constructor(message: string, service: string) {
        super(message, 2);
        this.name = 'ExternalServiceError';
        this.service = service;
    }
}

type CommandExecutionErrorConstructor = {
    message: string;
    command: string;
    error: ExecException;
    stdout: string;
    stderr: string;
};
class CommandExecutionError extends AppError {
    public readonly command: string;
    public readonly error: ExecException;
    public readonly stdout: string;
    public readonly stderr: string;

    constructor({ command, error, message, stderr, stdout }: CommandExecutionErrorConstructor) {
        super(message, 1);
        this.name = 'CommandExecutionError';
        this.command = command;
        this.error = error;
        this.stderr = stderr;
        this.stdout = stdout;
    }
}

class ErrorHandler {
    private static _subscriber: ((error: AppError) => void)[] = [];

    static subscribe(subscriber: (error: AppError) => void) {
        this._subscriber.push(subscriber);
        return () => this.unsubscribe(subscriber);
    }

    static unsubscribe(subscriber: (error: AppError) => void) {
        this._subscriber = this._subscriber.filter(s => s !== subscriber);
    }

    static throw(error: AppError) {
        let i = 0;
        this._subscriber.forEach(s => {
            s(error);
            i++;
        });
        if (i === 0) throw error;
    }
}

export {
    AppError,
    CommandExecutionError,
    ErrorHandler,
    ExternalServiceError,
    GitServiceError,
    type CommandExecutionErrorConstructor
};
