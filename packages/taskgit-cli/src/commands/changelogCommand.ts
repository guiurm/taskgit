import { ChangeLogService, FilesReportService } from '@guiurm/taskgit-core';
import { genCommand } from '@guiurm/termify';

const changelogCommand = genCommand({
    name: 'changelog',
    options: [
        {
            name: 'from',
            flag: '-f',
            alias: ['--from'],
            optionType: 'string',
            required: false
        },

        {
            name: 'to',
            flag: '-t',
            alias: ['--to'],
            optionType: 'string',
            required: false
        },
        {
            name: 'branch',
            flag: '-b',
            alias: ['--branch'],
            optionType: 'string',
            required: false
        },
        {
            name: 'version',
            flag: '-v',
            alias: ['--version'],
            optionType: 'string',
            required: true
        }
    ] as const,
    args: [
        {
            name: 'outputFile',
            type: 'string',
            required: true
        }
    ] as const
});

changelogCommand.action(async ({ from, to, branch, version }, { outputFile }) => {
    const commits = await FilesReportService.log({ to, from, branch });
    ChangeLogService.generateChangelog({ commits, version, outputFile });

    console.log(`New release notes in: ${outputFile ?? 'changelog.md'}`);
});

export { changelogCommand };
