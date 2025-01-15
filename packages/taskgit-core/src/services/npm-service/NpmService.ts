import { AppError, ErrorHandler } from '@services/error-handler';
import { exeCommand } from '@services/exe-service';

type TAllVersionOptions = {
    type?: 'major' | 'minor' | 'patch' | 'premajor' | 'preminor' | 'prepatch' | 'prerelease' | 'from-git';
    version?: string;
    useCommitHooks?: boolean;
    createTag?: boolean;
    customMessage?: string;
    /**
     * Custom pre id for the pre*
     */
    preid?: string;
};

type TExactVersionOptions = Pick<TAllVersionOptions, 'version' | 'useCommitHooks' | 'createTag' | 'customMessage'>;
type TPreVersionOptions = Pick<TAllVersionOptions, 'preid' | 'useCommitHooks' | 'createTag' | 'customMessage'>;
type TVersionOptions = Pick<TAllVersionOptions, 'useCommitHooks' | 'createTag' | 'customMessage'>;

class NpmService {
    /**
     * Runs the npm version command with the given options.
     * @param data
     * @returns The output of the command as a string.
     * @throws AppError if type or version is not provided.
     * @throws AppError if both type and version are provided.
     */
    public static async version(data: TAllVersionOptions): Promise<string> {
        let command = ['npm version'];

        if (!data.type && !data.version)
            ErrorHandler.throw(new AppError('Type or version must be provided for this option.'));
        if (data.type && data.version)
            console.warn('Type and version cannot be provided at the same time. Ommitted version.');

        command.push(data.version || (data.type as string));

        if (!data.useCommitHooks) command.push('--no-commit-hooks');
        if (!data.createTag) command.push('--no-git-tag-version');

        if (data.preid) {
            if (!['premajor', 'preminor', 'prepatch', 'prerelease'].includes(data.type as string))
                console.warn(
                    'Preid can only be used with "premajor", "preminor", "prepatch" or "prerelease" this option has no effect.'
                );
            else command.push(`--preid=${data.preid}`);
        }

        if (data.customMessage) command.push(`--message="${data.customMessage}"`);

        command.push('--json');

        console.log(command.join(' '));

        return await exeCommand(command.join(' '));
    }

    /**
     * Increases the version exactly to the given version.
     * @param data
     * @returns The output of the command as a string.
     * @throws AppError if version is not provided.
     */
    public static async exactVersion({
        createTag,
        customMessage,
        useCommitHooks,
        version
    }: TExactVersionOptions): Promise<string> {
        return await this.version({ createTag, customMessage, useCommitHooks, version });
    }

    /**
     * Increase the prerelease patch version.
     *
     * @example
     * await NpmService.prePatch();
     *
     * @param {Object} [options]
     * @param {boolean} [options.createTag=true] - Whether to create a new tag from the new version.
     * @param {string} [options.customMessage] - The message to use when creating a new tag.
     * @param {string} [options.preid] - The prerelease identifier to use.
     * @param {boolean} [options.useCommitHooks=true] - Whether to use the commit hooks.
     * @returns {Promise<string>}
     */
    public static async prePatch({
        createTag,
        customMessage,
        preid,
        useCommitHooks
    }: TPreVersionOptions): Promise<string> {
        return await this.version({ createTag, customMessage, preid, useCommitHooks, type: 'prepatch' });
    }

    /**
     * Increase the prerelease minor version.
     *
     * @example
     * await NpmService.preMinor();
     *
     * @param {Object} [options]
     * @param {boolean} [options.createTag=true] - Whether to create a new tag from the new version.
     * @param {string} [options.customMessage] - The message to use when creating a new tag.
     * @param {string} [options.preid] - The prerelease identifier to use.
     * @param {boolean} [options.useCommitHooks=true] - Whether to use the commit hooks.
     * @returns {Promise<string>}
     */
    public static async preMinor({
        createTag,
        customMessage,
        preid,
        useCommitHooks
    }: TPreVersionOptions): Promise<string> {
        return await this.version({ createTag, customMessage, preid, useCommitHooks, type: 'preminor' });
    }

    /**
     * Increase the prerelease major version.
     *
     * @example
     * await NpmService.preMajor();
     *
     * @param {Object} [options]
     * @param {boolean} [options.createTag=true] - Whether to create a new tag from the new version.
     * @param {string} [options.customMessage] - The message to use when creating a new tag.
     * @param {string} [options.preid] - The prerelease identifier to use.
     * @param {boolean} [options.useCommitHooks=true] - Whether to use the commit hooks.
     * @returns {Promise<string>}
     */
    public static async preMajor({
        createTag,
        customMessage,
        preid,
        useCommitHooks
    }: TPreVersionOptions): Promise<string> {
        return await this.version({ createTag, customMessage, preid, useCommitHooks, type: 'premajor' });
    }

    /**
     * Increase the prerelease version.
     *
     * @example
     * await NpmService.preRelease();
     *
     * @param {Object} [options]
     * @param {boolean} [options.createTag=true] - Whether to create a new tag from the new version.
     * @param {string} [options.customMessage] - The message to use when creating a new tag.
     * @param {string} [options.preid] - Custom pre identifier for the prerelease.
     * @param {boolean} [options.useCommitHooks=true] - Whether to use the commit hooks.
     * @returns {Promise<string>}
     */
    public static async preRelease({
        createTag,
        customMessage,
        preid,
        useCommitHooks
    }: TPreVersionOptions): Promise<string> {
        return await this.version({ createTag, customMessage, preid, useCommitHooks, type: 'prerelease' });
    }

    /**
     * Increase the major version.
     *
     * @example
     * await NpmService.major();
     *
     * @param {Object} [options]
     * @param {boolean} [options.createTag=true] - Whether to create a new tag from the new version.
     * @param {string} [options.customMessage] - The message to use when creating a new tag.
     * @param {boolean} [options.useCommitHooks=true] - Whether to use the commit hooks.
     * @returns {Promise<string>}
     */
    public static async major({ createTag, customMessage, useCommitHooks }: TVersionOptions): Promise<string> {
        return await this.version({ type: 'major', createTag, customMessage, useCommitHooks });
    }

    /**
     * Increase the minor version.
     *
     * @example
     * await NpmService.minor();
     *
     * @param {Object} [options]
     * @param {boolean} [options.createTag=true] - Whether to create a new tag from the new version.
     * @param {string} [options.customMessage] - The message to use when creating a new tag.
     * @param {boolean} [options.useCommitHooks=true] - Whether to use the commit hooks.
     * @returns {Promise<string>}
     */
    public static async minor({ createTag, customMessage, useCommitHooks }: TVersionOptions): Promise<string> {
        return await this.version({ type: 'minor', createTag, customMessage, useCommitHooks });
    }

    /**
     * Increase the patch version.
     *
     * @example
     * await NpmService.patch();
     *
     * @param {Object} [options]
     * @param {boolean} [options.createTag=true] - Whether to create a new tag from the new version.
     * @param {string} [options.customMessage] - The message to use when creating a new tag.
     * @param {boolean} [options.useCommitHooks=true] - Whether to use the commit hooks.
     * @returns {Promise<string>}
     */
    public static async patch({ createTag, customMessage, useCommitHooks }: TVersionOptions): Promise<string> {
        return await this.version({ type: 'patch', createTag, customMessage, useCommitHooks });
    }
}

export {
    NpmService,
    type TAllVersionOptions,
    type TExactVersionOptions,
    type TPreVersionOptions,
    type TVersionOptions
};
