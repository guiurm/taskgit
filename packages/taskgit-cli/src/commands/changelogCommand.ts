import { ChangeLogService, GitService } from '@guiurm/taskgit-core';
import { genCommand } from '@guiurm/termify';

const changelogCommand = genCommand({
    name: 'changelog',
    options: [
        {
            name: 'from',
            flag: '-f',
            alias: ['--from'],
            optionType: 'string'
        },

        {
            name: 'to',
            flag: '-t',
            alias: ['--to'],
            optionType: 'string'
        },
        {
            name: 'branch',
            flag: '-b',
            alias: ['--branch'],
            optionType: 'string'
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

changelogCommand.action(async ({ from, to, branch }, { outputFile }) => {
    const commits = await GitService.log({ to, from, branch });
    ChangeLogService.generateChangelog({ commits, version: '1.0.0', outputFile });

    console.log(`New release notes in: ${outputFile ?? 'changelog.md'}`);
});

export { changelogCommand };
