import { exeCommand, parseTagsList } from '../utils/gitServiceUtils';

class GitServiceTagger {
    public static async createAnnotatedTag({ message, name }: { name: string; message?: string }) {
        let command = `git tag -a ${name}`;
        if (message) command += ` -m "${message}"`;
        return await exeCommand(command);
    }

    public static async createLightweightTag(name: string) {
        return await exeCommand(`git tag ${name}`);
    }

    public static async deleteTag(name: string) {
        return await exeCommand(`git tag -d ${name}`);
    }

    public static async pushTag(name: string) {
        return await exeCommand(`git push origin ${name}`);
    }

    public static async deleteRemoteTag(name: string, remote = 'origin') {
        return await exeCommand(`git push --delete ${remote} ${name}`);
    }

    public static async listTagsLocal(): Promise<
        {
            tag: string;
            commit: string;
        }[]
    > {
        const list = parseTagsList(await exeCommand('git show-ref --tags'));

        return list.length === 0 ? [] : list;
    }

    public static async tagExists(tag: string): Promise<boolean> {
        const tags = await this.listTagsNamesLocal();
        return tags.includes(tag);
    }

    public static async listTagsNamesLocal() {
        return (await exeCommand('git tag')).split('\n');
    }

    public static async listTagsRemote(): Promise<
        {
            tag: string;
            commit: string;
        }[]
    > {
        const list = parseTagsList(await exeCommand('git ls-remote --tags'));

        return list.length === 0 ? [] : list;
    }
}

export { GitServiceTagger };
