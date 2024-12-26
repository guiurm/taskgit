export type TFileListStatus = {
    added: string[];
    modified: string[];
    deleted: string[];
};

export type TGitDiffOutputFileConf = {
    file: string;
    fileName: string;
    index: string;
    aFile: string;
    bFile: string;
    hunks: string[];
};

/**
 * Options for the git diff command.
 */
export interface GitDiffOptions {
    /**
     * The first branch to compare.
     */
    branch1?: string;
    /**
     * The second branch to compare.
     */
    branch2?: string;
    /**
     * The file to compare.
     */
    file?: string;
    /**
     * The first commit to compare.
     */
    commit1?: string;
    /**
     * The second commit to compare.
     */
    commit2?: string;
    /**
     * Ignore all whitespace when comparing.
     */
    ignoreAllSpace?: boolean;
    /**
     * Ignore blank lines when comparing.
     */
    ignoreBlankLines?: boolean;
    /**
     * Ignore whitespace at the end of lines when comparing.
     */
    ignoreSpaceAtEol?: boolean;
    /**
     * Use the minimal diff algorithm.
     */
    minimal?: boolean;
    /**
     * Use the patience diff algorithm.
     */
    patience?: boolean;
    /**
     * Show a histogram of the differences.
     */
    histogram?: boolean;
    /**
     * Show the output in raw format.
     */
    raw?: boolean;
    /**
     * Show the output in patch format.
     */
    patch?: boolean;
    /**
     * Show the output in stat format.
     */
    stat?: boolean;
    /**
     * Show the output in numstat format.
     */
    numstat?: boolean;
    /**
     * Show the output in shortstat format.
     */
    shortstat?: boolean;
    /**
     * Ignore changes in whitespace between lines.
     */
    ignoreSpaceChanges?: boolean;
    /**
     * Ignore whitespace when comparing.
     */
    ignoreSpace?: boolean;
    /**
     * Ignore whitespace at the end of lines when comparing.
     */
    ignoreTrailingSpace?: boolean;
    /**
     * Ignore changes in whitespace between lines.
     */
    ignoreSpaceChangesBetweenLines?: boolean;
}

export type GitLogCommitInfo = {
    hash: string;
    author: {
        name: string;
        email: string;
    };
    date: string;
    title: string;
    body: string;
};
