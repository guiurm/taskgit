import { exeCommand, parseTagsList } from '../utils/gitServiceUtils';

class GitServiceTagger {
    /**
     * Creates an annotated tag on the local repository.
     *
     * @param {Object} param0 The parameters for creating the annotated tag.
     * @param {string} param0.name The name of the tag to create.
     * @param {string} [param0.message] An optional message for the annotated tag.
     * @returns {Promise<string>} The result of the command.
     */
    public static async createAnnotatedTag({ message, name }: { name: string; message?: string }): Promise<string> {
        let command = `git tag -a ${name}`;
        if (message) command += ` -m "${message}"`;
        return await exeCommand(command);
    }

    /**
     * Creates a lightweight tag on the local repository.
     *
     * @param {string} name The name of the tag to create.
     * @returns {Promise<string>} The result of the command.
     */
    public static async createLightweightTag(name: string): Promise<string> {
        return await exeCommand(`git tag ${name}`);
    }

    /**
     * Deletes a tag from the local repository.
     *
     * @param {string} name The name of the tag to delete.
     * @returns {Promise<string>} The result of the command.
     */

    public static async deleteTag(name: string): Promise<string> {
        return await exeCommand(`git tag -d ${name}`);
    }

    /**
     * Pushes a tag to the remote repository.
     *
     * @param {string} name The name of the tag to push.
     * @returns {Promise<string>} The result of the command.
     */
    public static async pushTag(name: string): Promise<string> {
        return await exeCommand(`git push origin ${name}`);
    }

    /**
     * Deletes a tag from the remote repository.
     *
     * @param {string} name The name of the tag to delete.
     * @param {string} [remote='origin'] The name of the remote repository to delete the tag from.
     * @returns {Promise<string>} The result of the command.
     */
    public static async deleteRemoteTag(name: string, remote: string = 'origin'): Promise<string> {
        return await exeCommand(`git push --delete ${remote} ${name}`);
    }

    /**
     * Lists all tags in the local repository.
     *
     * @returns {Promise<Array<{tag: string, commit: string}>>} A list of tags, where each tag is an object with a
     * `tag` property containing the tag name, and a `commit` property containing the commit hash the tag points to.
     * If there are no tags in the local repository, an empty list is returned.
     */
    public static async listTagsLocal(): Promise<
        {
            tag: string;
            commit: string;
        }[]
    > {
        const list = parseTagsList(await exeCommand('git show-ref --tags'));

        return list.length === 0 ? [] : list;
    }

    /**
     * Checks if a tag exists in the local repository.
     *
     * @param tag The name of the tag to check.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if the tag exists, false otherwise.
     */
    public static async tagExists(tag: string): Promise<boolean> {
        const tags = await this.listTagsNamesLocal();
        return tags.includes(tag);
    }

    /**
     * Lists all tag names in the local repository.
     *
     * @returns {Promise<string[]>} A list of tag names, or an empty list if there are no tags in the local repository.
     */
    public static async listTagsNamesLocal(): Promise<string[]> {
        return (await exeCommand('git tag')).split('\n');
    }

    /**
     * Lists all tags in the remote repository.
     *
     * @returns {Promise<Array<{tag: string, commit: string}>>} A list of tags, where each tag is an object with a
     * `tag` property containing the tag name, and a `commit` property containing the commit hash the tag points to.
     * If there are no tags in the remote repository, an empty list is returned.
     */
    public static async listTagsRemote(): Promise<
        {
            tag: string;
            commit: string;
        }[]
    > {
        const list = parseTagsList((await exeCommand('git ls-remote --tags')).slice(1));

        return list.length === 0 ? [] : list;
    }
}

export { GitServiceTagger };
