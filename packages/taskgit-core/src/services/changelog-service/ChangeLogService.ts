import { GitLogCommitInfo } from '@app-types';
import { wf } from '@services/file-management-service/fileService';
import { MarkdownService } from '@services/markdown-service/MarkdownService';

type ChangelogSections = {
    added: GitLogCommitInfo[];
    fixed: GitLogCommitInfo[];
    documentation: GitLogCommitInfo[];
    changed: GitLogCommitInfo[];
    removed: GitLogCommitInfo[];
    deprecated: GitLogCommitInfo[];
    security: GitLogCommitInfo[];
};

class ChangeLogService {
    /**
     * Groups a list of commit objects into sections based on their titles.
     *
     * The sections are:
     *
     * - added: commits with titles starting with 'feat'
     * - fixed: commits with titles starting with 'fix'
     * - documentation: commits with titles starting with 'docs'
     * - changed: commits with titles starting with 'style', 'refactor', 'perf', 'test', 'chore', 'build', or 'ci'
     * - removed: commits with titles starting with 'removed'
     * - deprecated: commits with titles starting with 'deprecated'
     * - security: commits with titles starting with 'security'
     *
     * @param {GitLogCommitInfo[]} commits - An array of commit objects
     * @returns {ChangelogSections}
     */
    public static groupCommitSections(commits: GitLogCommitInfo[]): ChangelogSections {
        const sections: ChangelogSections = {
            added: [],
            fixed: [],
            documentation: [],
            changed: [],
            removed: [],
            deprecated: [],
            security: []
        };

        const keywordsMap: { [key: string]: keyof ChangelogSections } = {
            feat: 'added',
            fix: 'fixed',
            docs: 'documentation',
            style: 'changed',
            refactor: 'changed',
            perf: 'changed',
            test: 'changed',
            chore: 'changed',
            build: 'changed',
            ci: 'changed',
            removed: 'removed',
            deprecated: 'deprecated',
            security: 'security'
        };

        commits.forEach(commit => {
            const title = commit.title.toLowerCase();
            for (const keyword in keywordsMap) {
                if (title.startsWith(keyword)) {
                    sections[keywordsMap[keyword]].push(commit);
                    break;
                }
            }
        });

        return sections;
    }

    /**
     * Generates a changelog file based on a list of commit objects.
     *
     * @param {object} data - An object containing the commits, version, and optional output file name.
     * @param {GitLogCommitInfo[]} data.commits - An array of commit objects.
     * @param {string} data.version - The version number to include in the changelog.
     * @param {string} [data.outputFile='changelog.md'] - The file name to save the changelog to.
     */
    public static generateChangelog(data: { commits: GitLogCommitInfo[]; outputFile?: string; version: string }) {
        const { commits, version, outputFile = 'changelog.md' } = data;
        const sections = this.groupCommitSections(commits);
        const md = new MarkdownService();

        md.addTitle('Changelog')
            .addEndLine()
            .addTitle(`${version} - ${new Date().toISOString().split('T')[0]}`, 2);

        this._writeSection(sections.added, 'Added', md);
        this._writeSection(sections.fixed, 'Fixed', md);
        this._writeSection(sections.changed, 'Changed', md);
        this._writeSection(sections.removed, 'Removed', md);
        this._writeSection(sections.documentation, 'Documentation', md);
        this._writeSection(sections.deprecated, 'Deprecated', md);
        this._writeSection(sections.security, 'Security', md);

        wf(outputFile, md.contentMarkdown);
    }

    /**
     * Writes a section in the markdown document for a given list of commits.
     *
     * @param {GitLogCommitInfo[]} commits - An array of commit objects to be included in the section.
     * @param {string} title - The title of the section to be added to the markdown document.
     * @param {MarkdownService} md - The markdown service instance used to create and modify the markdown content.
     *
     * @returns {void}
     */
    private static _writeSection(commits: GitLogCommitInfo[], title: string, md: MarkdownService): void {
        if (commits.length === 0) return void 0;
        md.addTitle(title, 2).addUnorderedList(
            commits.map(commit => {
                let message = `${commit.title} (#${commit.hash.slice(0, 7)}) - ${commit.author.name} \\<${commit.author.email}>`;
                if (commit.body.length > 0) message += `\n\n  ${commit.body.split('\n').join('\n  ')}`;
                return message;
            })
        );
    }
}

export { ChangeLogService };
