import { question } from '@guiurm/askly';
import { GitServiceTagger } from '@guiurm/taskgit-core';
import { genCommand } from '@guiurm/termify';

const tagAddCommand = genCommand({ name: 'tag-add' });

tagAddCommand.action(async () => {
    console.log('Creating new tag:');
    const name = await question({ message: 'Tag name: ' });
    const message = await question({ message: 'Tag message: ' });
    const data = await GitServiceTagger.createAnnotatedTag({ name, message });
    console.log(data);
});

export { tagAddCommand };
