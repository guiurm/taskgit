import { exeCommand } from '@services/exe-service';

class SubtreeService {
    /**
     * Add a subtree to the current repository.
     *
     * @param url The URL of the subtree to add.
     * @param path The path to add the subtree to.
     */
    public static async addSubtree(url: string, path: string): Promise<string> {
        return await exeCommand(`git subtree add --prefix ${path} ${url} master`);
    }

    /**
     * Remove a subtree from the current repository.
     *
     * @param path The path of the subtree to remove.
     */
    public static async removeSubtree(path: string): Promise<string> {
        return await exeCommand(`git subtree remove --prefix ${path}`);
    }

    /**
     * Update a subtree by pulling the latest changes from the specified remote repository.
     *
     * @param url The URL of the remote repository where the subtree is located.
     * @param path The path within the repository where the subtree is located.
     * @returns A promise that resolves to the result of the git subtree pull command.
     */
    public static async updateSubtree(url: string, path: string): Promise<string> {
        return await exeCommand(`git subtree pull --prefix ${path} ${url} master`);
    }

    /**
     * Push the subtree to the specified remote repository.
     *
     * @param url The URL of the remote repository where the subtree is located.
     * @param path The path within the repository where the subtree is located.
     * @returns A promise that resolves to the result of the git subtree push command.
     */
    public static async pushSubtree(url: string, path: string): Promise<string> {
        return await exeCommand(`git subtree push --prefix ${path} ${url} master`);
    }

    /**
     * Fetch the latest changes for a subtree from the specified remote repository.
     *
     * @param url The URL of the remote repository where the subtree is located.
     * @param path The path within the repository where the subtree is located.
     * @returns A promise that resolves to the result of the git subtree fetch command.
     */
    public static async fetchSubtree(url: string, path: string): Promise<string> {
        return await exeCommand(`git subtree fetch --prefix ${path} ${url} master`);
    }

    /**
     * Split the subtree at the specified path to the specified remote repository.
     *
     * This will create a new branch on the remote repository containing the subtree
     * and all of its history. The subtree will be split from the 'master' branch of
     * the remote repository.
     *
     * @param url The URL of the remote repository where the subtree is located.
     * @param path The path within the repository where the subtree is located.
     * @returns A promise that resolves to the result of the git subtree split command.
     */
    public static async splitSubtreeToRemote(url: string, path: string): Promise<string> {
        return await exeCommand(`git subtree split --prefix ${path} ${url} master`);
    }

    /**
     * Merge the subtree from the specified remote repository into the current repository.
     *
     * @param url The URL of the remote repository containing the subtree to merge.
     * @param path The path within the repository where the subtree is located.
     * @returns A promise that resolves to the result of the git subtree merge command.
     */
    public static async mergeSubtreeToRemote(url: string, path: string): Promise<string> {
        return await exeCommand(`git subtree merge --prefix ${path} ${url} master`);
    }

    /**
     * Split the subtree at the specified path to a new local branch.
     *
     * This will create a new branch containing the subtree and all of its history.
     *
     * @param path The path within the repository where the subtree is located.
     * @param branch The name of the new branch to create.
     * @returns A promise that resolves to the result of the git subtree split command.
     */
    public static async splitSubtreeToLocal(path: string, branch: string): Promise<string> {
        return await exeCommand(`git subtree split --prefix ${path} -b ${branch}`);
    }
}

export { SubtreeService };
