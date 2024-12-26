import { confirm, question, select } from '@guiurm/askly';
import { genCommand } from '@guiurm/termify';
import { AppError, ErrorHandler, ExternalServiceError } from '../error-handler';
import { COMMIT_STANDARD_TYPES } from '../globals';
import { GitService } from '../services/gitService';
import { exeCommand } from '../utils/gitServiceUtils';

const commitCommand = genCommand(
    'commit',
    [
        {
            name: 'type',
            optionType: 'string',
            flag: '-t',
            alias: ['--type'],
            defaultValue: 'wip',
            required: false,

            customValidator: n => {
                if (!COMMIT_STANDARD_TYPES.map(t => t.name).includes(n))
                    ErrorHandler.throw(new AppError('Invalid type of commit'));
                return n;
            }
        },
        {
            name: 'title',
            optionType: 'string',
            flag: '-m',
            alias: ['--title'],

            required: false
        },
        {
            name: 'body',
            optionType: 'string',
            flag: '-b',
            alias: ['--message'],

            required: false
        },
        { name: 'ammend', optionType: 'boolean', flag: '-a', alias: ['--ammend'], required: false, defaultValue: false }
    ] as const,
    [] as const
);

commitCommand.action(async (_, { body, title, type, ammend }, argsP) => {
    const report = await GitService.filesReport();
    if (report.stagedReport() === '') {
        ErrorHandler.throw(
            new AppError(
                "There are no files staged for commit, first add some.\nIt appears that you haven't added any files to the staging area. Please use git add <file> to stage your changes before committing."
            )
        );
    }

    let target = '';

    if (!type)
        try {
            type = (
                await select({
                    choices: COMMIT_STANDARD_TYPES.map(t => ({
                        name: `${t.icon} ${t.name}`,
                        value: t.name,
                        description: t.description
                    })),
                    message: 'Select type: '
                })
            ).value;
        } catch (error) {
            ErrorHandler.throw(new ExternalServiceError('Error obtaining commit info bia cly', 'askly'));
        }

    target = await question({ message: 'Target: ' });
    if (!title) title = await question({ message: 'Title: ' });
    if (!body) body = await question({ message: 'Body: ' });
    if (ammend) ammend = (await confirm('Ammend commit?')) as boolean;
    target = target ? `(${target})` : target;

    const author = await GitService.getUser();
    console.log('\nauthor: ', author.toString());

    console.log('type: ', type);
    console.log('title: ', title);
    console.log('body: ', body);

    console.log('\n', report.stagedReport());

    if (await confirm('Is this correct?')) {
        console.log('\nCommitting...');
        const command = `git commit ${ammend ? '--amend' : ''} -m "${type}${target}: ${title}\n\n${body}"`;
        const result = await exeCommand(command);
        console.log('result:');
        console.log(result);
    } else {
        console.log('\nAborting...');
        process.exit(1);
    }
});

export { commitCommand };
