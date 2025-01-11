import { AppError, ErrorHandler, GitServiceTagger } from '@guiurm/taskgit-core';
import { genCommand } from '@guiurm/termify';

const tagListCommand = genCommand({
    name: 'tag-list',
    options: [
        { name: 'listLocal', flag: '-ll', alias: ['--list-local'], optionType: 'boolean', required: false },
        { name: 'listRemote', flag: '-lr', alias: ['--list-remote'], optionType: 'boolean', required: false },
        { name: 'list', flag: '-l', alias: ['--list'], optionType: 'boolean', required: false }
    ]
});

tagListCommand.action(async ({ list, listLocal, listRemote }) => {
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
            case 'listLocal': {
                console.log('Local tags:');
                const tags = await GitServiceTagger.listTagsLocal();
                console.log(
                    tags.length === 0
                        ? 'No local tags found.'
                        : tags.map(({ tag, commit }) => ` * ${commit} ${tag}`).join('\n')
                );
                break;
            }
            case 'listRemote': {
                console.log('Remote tags:');
                const tags = await GitServiceTagger.listTagsRemote();
                console.log(
                    tags.length === 0
                        ? 'No remote tags found.'
                        : tags.map(({ tag, commit }) => ` * ${commit} ${tag}`).join('\n')
                );
                break;
            }
            case 'list':
                const [local, remote] = await Promise.all([
                    GitServiceTagger.listTagsLocal(),
                    GitServiceTagger.listTagsRemote()
                ]);

                console.log('Local tags:');
                console.log(
                    local.length === 0
                        ? '  No local tags found.'
                        : local.map(({ tag, commit }) => ` * ${commit} ${tag}`).join('\n')
                );
                console.log('Remote tags:');
                console.log(
                    remote.length === 0
                        ? '  No remote tags found.'
                        : remote.map(({ tag, commit }) => ` * ${commit} ${tag}`).join('\n')
                );

                break;
            case undefined:
            default:
                ErrorHandler.throw(new AppError(`Invalid option: ${command}`));
        }
    }
});

export { tagListCommand };
