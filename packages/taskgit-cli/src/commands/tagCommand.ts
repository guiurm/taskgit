import { AppError, ErrorHandler, TaggerService } from '@guiurm/taskgit-core';
import { genCommand } from '@guiurm/termify';

const tagCommand = genCommand({
    name: 'tag',
    options: [
        {
            name: 'tagName',
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
        },
        { name: 'listLocal', flag: '-ll', alias: ['--list-local'], optionType: 'boolean', required: false },
        { name: 'listRemote', flag: '-lr', alias: ['--list-remote'], optionType: 'boolean', required: false },
        { name: 'list', flag: '-l', alias: ['--list'], optionType: 'boolean', required: false }
    ] as const
});

tagCommand.action(async ({ tagName, message, remove, remote, list, listLocal, listRemote }) => {
    const optionsList = [
        ...[
            { name: 'add', value: tagName },
            { name: 'remove', value: remove }
        ].filter(({ value: v }) => typeof v === 'string'),
        ...[
            { name: 'list', value: list },
            { name: 'listLocal', value: listLocal },
            { name: 'listRemote', value: listRemote }
        ].filter(({ value: v }) => v === true)
    ];

    if (optionsList.length > 1)
        ErrorHandler.throw(
            new AppError(
                `\n > Error: The options "${optionsList.map(item => item.name).join(', ')}" provided are incompatible.\n` +
                    `   Please check the command and ensure that the options you are using do not conflict with each other. For more information, use the '--help' flag.\n`
            )
        );

    let res: string = '';

    const localTags = await TaggerService.listTagsLocal();
    const remoteTags = await TaggerService.listTagsRemote();

    const existTag = localTags.find(({ tag }) => tag === tagName);

    switch (optionsList[0].name) {
        case 'add': {
            if (!message && !existTag)
                res = await TaggerService.createLightweightTag(tagName as string).then(
                    () => `\n > 'New light tag added!: ${tagName}'\n`
                );
            else if (message && !existTag)
                res = await TaggerService.createAnnotatedTag({ name: tagName as string, message }).then(
                    () => `\n > 'New annotated tag added!: ${tagName}'\n`
                );

            if (remote) {
                if (existTag)
                    console.warn(
                        `\n > Tag ${tagName} already exists locally at ${existTag.commit}, trying to push ${remote}!`
                    );
                console.log(`\n > Pushing tag to remote ${remote}...`);

                res += `\n > Remote ${remote}:\n   ${await TaggerService.pushTag(tagName as string)}\n\n`;
            }
            break;
        }
        case 'remove': {
            if (!existTag) console.warn(`\n > Tag ${remove} does not exist locally!`);
            else res = 'Tag removed!: ' + (await TaggerService.deleteTag(remove as string));
            if (remote) {
                console.log(`\n > Pushing changes to remote ${remote}...`);
                const commandRes = await TaggerService.deleteRemoteTag(remove as string, remote);
                res += `Tag removed from '${remote}'!: ${commandRes}`;
            }
        }
        case 'list': {
            res = ' > Local tags:\n' + localTags.map(({ tag, commit }) => ` * ${commit} ${tag}`).join('\n') + '\n\n';
            res += ' > Remote tags:\n' + remoteTags.map(({ tag, commit }) => ` * ${commit} ${tag}`).join('\n');
            break;
        }
        case 'listLocal': {
            res = 'Local tags:\n' + localTags.map(({ tag, commit }) => ` * ${commit} ${tag}`).join('\n');
            break;
        }
        case 'listRemote': {
            res = 'Remote tags:\n' + remoteTags.map(({ tag, commit }) => ` * ${commit} ${tag}`).join('\n');
            break;
        }
    }

    console.log(res);
});

export { tagCommand };
