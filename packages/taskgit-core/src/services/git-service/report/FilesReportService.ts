import { GitLogCommitInfo } from '@app-types';
import { LOG_SPLITTER } from '@globals';
import { exeCommand } from '@services/exe-service';
import { FilesReport } from '@services/git-service/report/FilesReport';
import { processFiles } from '@utils/gitServiceUtils';

class FilesReportService {
    /**
     * Get a list of staged files from Git.
     *
     * @returns A promise that resolves with an object containing three properties: added, modified and deleted.
     * Each property is an array of strings, containing the names of the files that have been added, modified or
     * deleted, respectively.
     * @throws {ExternalServiceError} If the command fails.
     */
    public static listStagedFiles = async () => {
        const data = await exeCommand('git diff --name-status --staged');
        return processFiles(data);
    };

    /**
     * Get a list of unstaged files from Git.
     *
     * @returns A promise that resolves with an object containing three properties: added, modified, and deleted.
     * Each property is an array of strings, containing the names of the files that have been added, modified, or
     * deleted, respectively.
     * @throws {ExternalServiceError} If the command fails.
     */

    public static async listUnstagedFiles() {
        const data = await exeCommand('git diff --name-status');
        return processFiles(data);
    }

    /**
     * Get a list of untracked files from Git.
     *
     * @returns A promise that resolves with an array of strings, containing the names of the files that are not
     * tracked by Git.
     * @throws {ExternalServiceError} If the command fails.
     */
    public static async listUntrackedFiles() {
        const data = await exeCommand('git ls-files --others --exclude-standard');

        return data
            .split('\n')
            .map(line => line.trim())
            .filter(f => f.length > 0);
    }

    /**
     * Get a report of the files in the Git repository, including staged, unstaged, and untracked files.
     *
     * @returns A promise that resolves with an object containing the file lists.
     * @throws {ExternalServiceError} If the command fails.
     */
    public static async filesReport() {
        const staged = await this.listStagedFiles();
        const unstaged = await this.listUnstagedFiles();
        const untracked = await this.listUntrackedFiles();
        return new FilesReport({ staged, unstaged, untracked });
    }

    /**
     * Get a list of Git commits.
     *
     * @param args An object with three optional properties: `from`, `to`, and `branch`.
     * `from` and `to` specify the range of commits to retrieve. If `from` is specified but `to` is not, the
     * function will retrieve all commits newer than `from`. If `to` is specified but `from` is not, the
     * function will retrieve all commits older than `to`.
     * `branch` specifies the branch from which to retrieve commits. If not specified, the function will use
     * the current branch.
     *
     * @returns A promise that resolves with an array of `GitLogCommitInfo` objects, each containing the
     * commit hash, author name, author email, commit date, commit title, and commit body.
     * @throws {ExternalServiceError} If the command fails.
     */
    public static async log(args: { from?: string; to?: string; branch?: string } = {}): Promise<GitLogCommitInfo[]> {
        const { from, to, branch = 'master' } = args;

        let command = `git log ${branch} --pretty=format:"%H%n%an%n%ae%n%ad%n%s%n%b${LOG_SPLITTER}"`;

        if (from) command += ` ${from}..${to ?? ''}`;

        const log = await exeCommand(command);
        return log
            .split(LOG_SPLITTER)
            .filter(l => l.length > 0)
            .map(c => {
                const [hash, authorName, email, date, message, ...body] = c
                    .trim()
                    .split('\n')
                    .map(l => l.trim());

                return {
                    hash: hash.trim(),
                    author: { name: authorName.trim(), email: email.trim() },
                    date: date.trim(),
                    title: message.trim(),
                    body: body.join('\n').trim()
                };
            });
    }
}

export { FilesReportService };
