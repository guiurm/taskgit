import { confirm, question, select } from '@guiurm/askly';
import { AppError, ErrorHandler, ExternalServiceError, GitService, exeCommand } from '@guiurm/taskgit-core';
import { genCommand } from '@guiurm/termify';
import { COMMIT_STANDARD_TYPES } from '../globals';

const commitCommand = genCommand({
    name: 'commit',
    args: [],
    options: [
        {
            name: 'type',
            optionType: 'string',
            flag: '-t',
            alias: ['--type'],
            //defaultValue: 'wip',
            required: false,

            customValidator: n => {
                if (
                    !COMMIT_STANDARD_TYPES.map(t => t.name).includes(
                        n as (typeof COMMIT_STANDARD_TYPES)[number]['name']
                    )
                )
                    return {
                        error: true,
                        message: `${n} is not a valid standard commit type. Valid types are ${COMMIT_STANDARD_TYPES.map(t => t.name).join(', ')}`
                    };
                else return { error: false };
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
        {
            name: 'ammend',
            optionType: 'boolean',
            flag: '-a',
            alias: ['--ammend'],
            required: false,
            defaultValue: false
        }
    ]
});

commitCommand.action(async ({ body, title, type, ammend }) => {
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
