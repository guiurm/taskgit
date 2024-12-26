import { genCommand } from '@guiurm/termify';
import { AppError, ErrorHandler } from '../error-handler';
import { GitService } from '../services/gitService';

const validTargets = ['staged', 'unstaged', 'untracked'] as const;
const reportCommand = genCommand(
    'report',
    [
        {
            flag: '-t',
            name: 'target',
            optionType: 'string',
            required: false,
            alias: ['--target'],
            customValidator: value => {
                if (!validTargets.includes(value))
                    ErrorHandler.throw(new AppError(`Invalid value fot target: ${value}`));
                return value;
            }
        }
    ] as const,
    [] as const
);
reportCommand.action(async (_, { target }) => {
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
