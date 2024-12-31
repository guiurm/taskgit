import { AppError, ErrorHandler, GitServiceTagger } from '@guiurm/taskgit-core';
import { genCommand } from '@guiurm/termify';

const tagListCommand = genCommand(
    'tag-list',
    [
        { name: 'listLocal', flag: '-ll', alias: ['--list-local'], optionType: 'boolean', required: false },
        { name: 'listRemote', flag: '-lr', alias: ['--list-remote'], optionType: 'boolean', required: false },
        { name: 'list', flag: '-l', alias: ['--list'], optionType: 'boolean', required: false }
        //
    ] as const,
    [] as const
);

tagListCommand.action(async (_, { list, listLocal, listRemote }) => {
    const uniqueOptions = [
        { option: listLocal, name: 'listLocal' },
        { option: listRemote, name: 'listRemote' },
        { option: list, name: 'list' }
    ].filter(item => item.option);

    if (uniqueOptions.length > 1) {
        const list = [...uniqueOptions];
        const last = list.pop();
        const message = `The options "${list.map(item => item.name).join(', ')}""${last ? ' and ' + last.name : ''}" are mutually exclusive and cannot be used together. The valid and mutually exclusive options are: -ll, -lr or -l.`;
        ErrorHandler.throw(new AppError(message));
    } else {
        const command = uniqueOptions[0]?.name;

        switch (command) {
            case 'listLocal':
                console.log('Local tags:');
                console.log((await GitServiceTagger.listTagsLocal()) ?? 'No local tags found.');
                break;
            case 'listRemote':
                console.log('Remote tags:');
                console.log((await GitServiceTagger.listTagsRemote()) ?? 'No remote tags found.');
                break;
            case 'list':
                const [local, remote] = await Promise.all([
                    GitServiceTagger.listTagsLocal(),
                    GitServiceTagger.listTagsRemote()
                ]);

                console.log('Local tags:');
                console.log(local ?? '  No local tags found.');
                console.log('Remote tags:');
                console.log(remote ?? '  No remote tags found.');

                break;
            case undefined:
            default:
                ErrorHandler.throw(new AppError(`Invalid option: ${command}`));
        }
    }
});

export { tagListCommand };
