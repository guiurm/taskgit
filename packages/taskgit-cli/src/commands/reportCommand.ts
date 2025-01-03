import { GitService } from '@guiurm/taskgit-core';
import { genCommand } from '@guiurm/termify';

const validTargets = ['staged', 'unstaged', 'untracked'] as const;
const reportCommand = genCommand({
    name: 'report',
    options: [
        {
            flag: '-t',
            name: 'target',
            optionType: 'string',
            required: false,
            alias: ['--target'],
            customValidator: value => {
                if (!validTargets.includes(value as (typeof validTargets)[number]))
                    return {
                        error: true,
                        message: `Invalid value for target: ${value}`
                    };
                else return { error: false };
            }
        }
    ],
    args: []
});
reportCommand.action(async ({ target }) => {
    const files = await GitService.filesReport();

    switch (target) {
        case 'staged':
            console.log(files.stagedReport());
            break;
        case 'unstaged':
            console.log(files.unstagedReport());
            break;
        case 'untracked':
            console.log(files.untrackedReport());
            break;
        default:
            console.log(files.totalReport());
    }
});

export { reportCommand };
