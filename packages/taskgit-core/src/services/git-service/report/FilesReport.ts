import { TFileListStatus } from '@app-types';

class FilesReport {
    public readonly staged: TFileListStatus;
    public readonly unstaged: TFileListStatus;
    public readonly untracked: string[];

    constructor({
        staged,
        unstaged,
        untracked
    }: {
        staged: TFileListStatus;
        unstaged: TFileListStatus;
        untracked: string[];
    }) {
        this.staged = staged;
        this.unstaged = unstaged;
        this.untracked = untracked;
    }

    protected _fileListStatus(list: TFileListStatus) {
        let report = '';
        list.added.forEach(f => (report += `\nA  ${f}`));
        list.modified.forEach(f => (report += `\nM  ${f}`));
        list.deleted.forEach(f => (report += `\nD  ${f}`));
        return report;
    }

    public stagedReport() {
        let report = '';
        if (this.staged.added.length > 0 || this.staged.modified.length > 0 || this.staged.deleted.length > 0)
            report += '\nStaged files:';
        report += this._fileListStatus(this.staged);
        return report;
    }

    public unstagedReport() {
        let report = '';
        if (this.unstaged.added.length > 0 || this.unstaged.modified.length > 0 || this.unstaged.deleted.length > 0)
            report += '\nUnstaged files:';
        report += this._fileListStatus(this.unstaged);
        return report;
    }

    public untrackedReport() {
        let report = '';
        if (this.untracked.length > 0) report += '\nUntracked files:';
        this.untracked.forEach(f => (report += `\nU  ${f}`));
        return report;
    }

    public totalReport() {
        let report = '';

        report += [this.stagedReport(), this.unstagedReport(), this.untrackedReport()].join('\n');

        return report;
    }
}

export { FilesReport };
