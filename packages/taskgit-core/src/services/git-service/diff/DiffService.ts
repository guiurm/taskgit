import { GitDiffOptions } from '@app-types';
import { exeCommand } from '@services/exe-service';
import { DiffOutputFile } from '@services/git-service/diff/DiffOutputFile';

class DiffService {
    /**
     * Execute the git diff command with the provided options.
     * @param options Options for the git diff command.
     * @returns The output of the git diff command.
     */
    public static async diff(options: GitDiffOptions): Promise<string> {
        const command = this._buildDiffCommand(options);

        return exeCommand(command);
    }

    /**
     * Build the git diff command based on the provided options.
     * @param options Options for the git diff command.
     * @returns The built git diff command.
     */
    private static _buildDiffCommand(options: GitDiffOptions): string {
        let command = 'git diff';

        // Add branch(es) or file
        if (options.branch1 && options.branch2) {
            command += ` ${options.branch1}..${options.branch2}`;
        } else if (options.branch1 && options.branch2 && options.commit1 && options.commit2) {
            command += ` ${options.branch1}...${options.branch2}`;
        } else if (options.file) {
            command += ` -- ${options.file}`;
        }

        // Add ignore whitespace options
        const ignoreSpaceOptions = [
            { option: options.ignoreAllSpace, flag: '--ignore-all-space' },
            { option: options.ignoreBlankLines, flag: '--ignore-blank-lines' },
            { option: options.ignoreSpaceAtEol, flag: '--ignore-space-at-eol' },
            { option: options.ignoreSpaceChanges, flag: '-b' },
            { option: options.ignoreSpace, flag: '-w' },
            { option: options.ignoreTrailingSpace, flag: '-w' },
            { option: options.ignoreSpaceChangesBetweenLines, flag: '-b' }
        ];

        ignoreSpaceOptions.forEach(option => {
            if (option.option) {
                command += ` ${option.flag}`;
            }
        });

        // Add format options
        const formatOptions = [
            { option: options.minimal, flag: '--minimal' },
            { option: options.patience, flag: '--patience' },
            { option: options.histogram, flag: '--histogram' },
            { option: options.raw, flag: '--raw' },
            { option: options.patch, flag: '--patch' },
            { option: options.stat, flag: '--stat' },
            { option: options.numstat, flag: '--numstat' },
            { option: options.shortstat, flag: '--shortstat' }
        ];

        formatOptions.forEach(option => {
            if (option.option) {
                command += ` ${option.flag}`;
            }
        });

        return command;
    }

    /**
     * Parses the output of a git diff command and extracts information about the files and their hunks.
     *
     * @param options Options for the git diff command.
     * @returns An array of DiffOutputFile objects, each containing details about a file and its hunks.
     *
     * The function splits the diff output into rows and iterates through them. It creates a new DiffOutputFile
     * object for each file detected in the diff output, collecting its hunks. Hunks are added to the current file
     * object until a new file is encountered.
     */
    public static async parseGitDiffOutput(options: GitDiffOptions): Promise<DiffOutputFile[]> {
        const diffOutput = await this.diff(options);
        const lines = diffOutput.split('\n');

        const parsedFiles: DiffOutputFile[] = [];
        let currentHunk = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('diff --git')) {
                const lastFile = parsedFiles[parsedFiles.length - 1];
                if (lastFile) {
                    lastFile.hunks.push(currentHunk);
                }
                currentHunk = '';

                const newFile = new DiffOutputFile({
                    file: line.replace('diff --git ', ''),
                    fileName: line.replace('diff --git ', '').split(' ')[0].replace('a/', ''),
                    index: lines[i + 1],
                    aFile: lines[i + 2],
                    bFile: lines[i + 3],
                    hunks: []
                });
                parsedFiles.push(newFile);
                i += 3;
            } else if (line.startsWith('@@')) {
                const lastFile = parsedFiles[parsedFiles.length - 1];
                if (lastFile) {
                    lastFile.hunks.push(currentHunk);
                }
                //currentHunk = line + '\n';
                currentHunk = line;
            } else {
                //currentHunk += `${line}\n`;
                currentHunk += `\n${line}`;
            }
        }
        const lastFile = parsedFiles[parsedFiles.length - 1];
        if (lastFile) {
            lastFile.hunks.push(currentHunk);
        }

        parsedFiles.forEach(file => {
            file.hunks = file.hunks.filter(hunk => hunk.length > 0);
        });

        return parsedFiles;
    }
}

export { DiffService };
