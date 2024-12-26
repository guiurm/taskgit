import { question } from '@guiurm/askly';
import { genCommand } from '@guiurm/termify';
import { GitServiceTagger } from '../services/GitServiceTagger';

const tagAddCommand = genCommand('tag-add', [], []);

tagAddCommand.action(async () => {
    console.log('Creating new tag:');
    const name = await question({ message: 'Tag name: ' });
    const message = await question({ message: 'Tag message: ' });
    const data = await GitServiceTagger.createAnnotatedTag({ name, message });
    console.log(data);
});

export { tagAddCommand };
