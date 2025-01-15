import { exeCommand } from '@/services';

class BranchService {
    public static async listBranches(): Promise<string[]> {
        return (await exeCommand('git branch --list'))
            .split('\n')
            .filter(b => b.length > 0)
            .map(b => b.trim());
    }

    public static async getCurrentBranch(): Promise<string> {
        return (await exeCommand('git branch --show-current')).trim();
    }

    public static async deleteBranch(name: string): Promise<string> {
        return await exeCommand(`git branch -d ${name}`);
    }

    public static async createBranch(name: string): Promise<string> {
        return await exeCommand(`git checkout -b ${name}`);
    }

    public static async checkoutBranch(name: string): Promise<string> {
        return await exeCommand(`git checkout ${name}`);
    }

    public static async mergeBranch(name: string): Promise<string> {
        return await exeCommand(`git merge ${name}`);
    }

    public static async pushBranch(name: string, origin: string): Promise<string> {
        return await exeCommand(`git push ${origin} ${name}`);
    }

    public static async pullBranch(name: string, origin: string): Promise<string> {
        return await exeCommand(`git pull ${origin} ${name}`);
    }

    public static async fetchBranch(name: string, origin: string): Promise<string> {
        return await exeCommand(`git fetch ${origin} ${name}`);
    }

    public static async deleteRemoteBranch(name: string, origin: string): Promise<string> {
        return await exeCommand(`git push --delete ${origin} ${name}`);
    }
}

export { BranchService };
