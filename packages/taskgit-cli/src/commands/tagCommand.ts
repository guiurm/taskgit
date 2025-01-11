import { GitServiceTagger } from '@guiurm/taskgit-core';
import { genCommand } from '@guiurm/termify';

const tagCommand = genCommand({
    name: 'tag',
    options: [
        {
            name: 'add',
            flag: '-a',
            alias: ['--add'],
            optionType: 'string',
            required: false
        },
        {
            name: 'message',
            flag: '-m',
            alias: ['--message'],
            optionType: 'string',
            required: false
        },
        {
            name: 'remove',
            flag: '-d',
            alias: ['--remove', '--delete'],
            optionType: 'string',
            required: false
        },
        {
            name: 'remote',
            flag: '-r',
            alias: ['--remote'],
            optionType: 'string',
            required: false
        }
        /*{ name: 'listLocal', flag: '-ll', alias: ['--list-local'], optionType: 'boolean', required: false },
        { name: 'listRemote', flag: '-lr', alias: ['--list-remote'], optionType: 'boolean', required: false },
        { name: 'list', flag: '-l', alias: ['--list'], optionType: 'boolean', required: false }*/
    ]
});

tagCommand.action(async ({ add, message, remove, remote }) => {
    const optionsInCompatible = [add, remove].filter(Boolean).length > 1;

    let res: string = '';

    const tagsList = await GitServiceTagger.listTagsLocal();

    const existTag = tagsList.find(({ tag }) => tag === add);

    if (add) {
        if (!message && !existTag)
            res = await GitServiceTagger.createLightweightTag(add).then(() => `\n > 'New light tag added!: ${add}'\n`);
        else if (message && !existTag)
            res = await GitServiceTagger.createAnnotatedTag({ name: add, message }).then(
                () => `\n > 'New annotated tag added!: ${add}'\n`
            );

        if (remote) {
            if (existTag)
                console.warn(`\n > Tag ${add} already exists locally at ${existTag.commit}, trying to push ${remote}!`);
            console.log(`\n > Pushing tag to remote ${remote}...`);
            await GitServiceTagger.pushTag(add);
            res += `\n > Tag pushed to remote ${remote}!\n`;
        }
    } else if (remove) {
        if (!existTag) console.warn(`\n > Tag ${remove} does not exist locally!`);
        else res = 'Tag removed!: ' + (await GitServiceTagger.deleteTag(remove));
        if (remote) {
            console.log(`\n > Pushing changes to remote ${remote}...`);
            res += `Tag removed from '${remote}'!: ${await GitServiceTagger.deleteRemoteTag(remove, remote)}`;
        }
    }

    console.log(res);
});

export { tagCommand };
