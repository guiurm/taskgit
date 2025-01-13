import { confirm } from '@guiurm/askly';
import { AppError, CacheStore, DiffService, ErrorHandler, exeCommand } from '@guiurm/taskgit-core';
import { genCommand } from '@guiurm/termify';

const diffPickCommand = genCommand({
    name: 'add-diff',
    args: [],
    options: [
        {
            alias: ['-f'],
            optionType: 'string',
            name: 'file',
            flag: '--file'
        }
    ]
});

diffPickCommand.action(async ({ file }) => {
    const diff = await DiffService.parseGitDiffOutput({ file });

    if (diff.length === 0) ErrorHandler.throw(new AppError(`No diff found for '${file}'.`));
    for (const fileDiff of diff) {
        console.log(`In file ${fileDiff.file}`);
        console.log(fileDiff.aFile);
        console.log(fileDiff.bFile + '\n');
        for (const hunk of fileDiff.hunks) {
            console.log(hunk);
            const answer = await confirm('Add this hunk?');
            if (answer) fileDiff.acceptedHunks.push(hunk);
            else fileDiff.ignoredHunks.push(hunk);
        }

        if (fileDiff.acceptedHunks.length === 0) continue;

        const cache = new CacheStore();
        const file = cache.getFileCache(
            cache.createPatchCache({
                acceptedDiff: fileDiff.getAcceptedDiffPatch() as string,
                filePath: fileDiff.file,
                originalDiff: fileDiff.getTotalDiffPatch(),
                ignoredDiff: fileDiff.getIgnoredDiffPatch() ?? undefined
            })
        );

        await exeCommand(`git checkout ${fileDiff.fileName}`);
        await exeCommand(`git apply ${file.acceptedChanges.cacheFilePath}`, async () => {
            await exeCommand(`git apply ${file.originalState.cacheFilePath}`);
            return true;
        });
        await exeCommand(`git add ${fileDiff.fileName}`);
        if (file.ignoredChanges) await exeCommand(`git apply ${file.ignoredChanges.cacheFilePath}`);

        cache.clearFileCache(file.hash);
    }
});

export { diffPickCommand };
