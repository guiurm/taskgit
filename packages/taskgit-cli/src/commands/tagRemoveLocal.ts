import { AppError, ErrorHandler, GitServiceTagger } from '@guiurm/taskgit-core';
import { genCommand } from '@guiurm/termify';

const tagRemoveCommand = genCommand({
    name: 'tag-remove',
    options: [
        { name: 'tagName', flag: '-t', alias: ['--tag'], optionType: 'string', required: true },
        {
            name: 'remote',
            flag: '-rem',
            alias: ['--remote'],
            defaultValue: 'origin',
            optionType: 'string',
            required: false
            //customTransformer: v => v || 'origin'
        }
    ]
});

tagRemoveCommand.action(async ({ tagName, remote }) => {
    let message = '';
    if (!tagName) ErrorHandler.throw(new AppError('No tag name provided.'));
    const tags = await GitServiceTagger.listTagsNamesLocal();
    if (!tags.includes(tagName as string)) ErrorHandler.throw(new AppError(`Tag ${tagName} not found.`));

    if (remote) {
        await GitServiceTagger.deleteRemoteTag(tagName as string, remote);
        message = `Tag ${tagName} removed successfully from ${remote}!`;
    } else {
        await GitServiceTagger.deleteTag(tagName as string);
        message = `Tag ${tagName} removed successfully!`;
    }
    console.log(message);
});

export { tagRemoveCommand };
