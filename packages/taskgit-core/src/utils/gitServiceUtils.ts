import { TFileListStatus } from '@app-types';

/**
 * Parse a string containing a list of tags with their commit hashes and
 * return a string with each tag in a separate line, indented by two spaces.
 * Each line is formatted as " * <tag> <commit>" and the tags are padded to
 * 15 characters.
 * @param data The string to parse.
 * @returns A string with the parsed list of tags.
 */
const parseTagsList = (data: string) => {
    return data
        .split('\n')
        .filter(l => l.length > 0)
        .map(l => {
            let [commit, tag] = l.replace('refs/tags/', '').replace(/\s+/g, ' ').trim().split(' ');

            Array.from({ length: 15 }, (_, i) => tag[i] ?? ' ').join('');
            tag = tag.replace('^{}', '');
            return { tag, commit };
        });
};

/**
 * Process a string containing a list of files with their status (from Git)
 * and return an object with three properties: added, modified and deleted.
 * Each property is an array of strings, containing the names of the files
 * that have been added, modified or deleted.
 *
 * @param data The string to process.
 * @returns An object with three properties: added, modified and deleted.
 */
const processFiles = (data: string): TFileListStatus => {
    const files = { added: [] as string[], modified: [] as string[], deleted: [] as string[] };

    data.split('\n')
        .map(line => line.trim())
        .forEach(line => {
            const status = line.charAt(0);
            const file = line.slice(2).trim();

            if (status === 'A') files.added.push(file);
            else if (status === 'M') files.modified.push(file);
            else if (status === 'D') files.deleted.push(file);
        });

    return files;
};

export { parseTagsList, processFiles };
