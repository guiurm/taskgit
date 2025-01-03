import { confirm, question } from '@guiurm/askly';
import { ErrorHandler, GitService, GitServiceError } from '@guiurm/taskgit-core';
import { genCommand } from '@guiurm/termify';

const configUserCommand = genCommand({
    name: 'config-user',
    options: [
        {
            name: 'name',
            optionType: 'string',
            flag: '-n',
            alias: ['--name'],
            required: false
        },
        {
            name: 'email',
            optionType: 'string',
            flag: '-e',
            alias: ['--email'],
            required: false
        }
    ],
    args: []
});
configUserCommand.action(async ({ name, email }) => {
    if (!name) name = await question({ message: 'User name: ' });
    if (!email) email = await question({ message: 'User email: ' });

    console.log('\nIs this correct?');

    console.log('name: ', name);
    console.log('email: ', email);

    if (await confirm('Is this correct?')) {
        console.log('\Updating user configuration...');
        try {
            await GitService.setUser(name, email);
        } catch (error) {
            ErrorHandler.throw(new GitServiceError('Error updating user configuration', 'setting user'));
        }
    } else {
        console.log('\nAborting...');
        process.exit(1);
    }
});

export { configUserCommand };
