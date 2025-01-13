import { TMP_DIR, TMP_PATCH_DIR } from '@globals';
import { sha1 } from '@services/file-management-service/fileService';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

if (!existsSync(TMP_DIR)) {
    mkdirSync(TMP_DIR);
}
if (!existsSync(TMP_PATCH_DIR)) {
    mkdirSync(TMP_PATCH_DIR);
}

export type CacheFile = {
    cacheFilePath: string;
    content: string;
};

export type FileChanges = {
    hash: string;
    originalState: CacheFile;
    acceptedChanges: CacheFile;
    ignoredChanges?: CacheFile;
};

class CacheStore {
    private static instance: CacheStore; // Instancia estática de la clase
    private files: Record<string, FileChanges>;

    constructor() {
        this.files = {};
        if (!CacheStore.instance) {
            CacheStore.instance = this;
        }
        return CacheStore.instance;
    }

    /**
     * Creates a new patch cache from the given information.
     *
     * @param {object} file
     * @param {string} file.originalDiff
     * @param {string} file.acceptedDiff
     * @param {string} [file.ignoredDiff]
     * @param {string} file.filePath
     * @returns {string} The hash of the created cache
     */
    public createPatchCache(file: {
        originalDiff: string;
        acceptedDiff: string;
        ignoredDiff?: string;
        filePath: string;
    }): string {
        const hash = sha1(file.filePath + Date.now().toString(16));
        const chacheFilePath = join(TMP_PATCH_DIR, hash);
        const fileChanges: FileChanges = {
            hash,
            acceptedChanges: {
                cacheFilePath: chacheFilePath + '-ac.patch',
                content: file.acceptedDiff
            },
            originalState: {
                cacheFilePath: chacheFilePath + '-or.patch',
                content: file.originalDiff
            }
        };

        if (file.ignoredDiff)
            fileChanges.ignoredChanges = {
                cacheFilePath: chacheFilePath + '-ig.patch',
                content: file.ignoredDiff
            };

        writeFileSync(fileChanges.originalState.cacheFilePath, fileChanges.originalState.content);
        writeFileSync(fileChanges.acceptedChanges.cacheFilePath, fileChanges.acceptedChanges.content);
        if (fileChanges.ignoredChanges)
            writeFileSync(fileChanges.ignoredChanges.cacheFilePath, fileChanges.ignoredChanges.content);

        this.files[hash] = fileChanges;

        return hash;
    }

    /**
     * Returns the cache stored with the given hash.
     *
     * @param {string} hash - The hash of the cache to retrieve
     * @returns {FileChanges} The cache or undefined if it does not exist
     */
    public getFileCache(hash: string): FileChanges {
        return this.files[hash];
    }

    /**
     * Clears the file cache associated with the given hash.
     *
     * @param {string} hash - The hash of the cache to clear.
     * @returns {boolean} - Returns false if the cache does not exist.
     * Deletes the cached files for the original state, accepted changes,
     * and ignored changes if they exist.
     */
    public clearFileCache(hash: string): boolean {
        const file = this.getFileCache(hash);
        if (!file) return false;

        unlinkSync(file.originalState.cacheFilePath);
        unlinkSync(file.acceptedChanges.cacheFilePath);
        if (file.ignoredChanges) unlinkSync(file.ignoredChanges.cacheFilePath);
        return true;
    }
}

export { CacheStore };
