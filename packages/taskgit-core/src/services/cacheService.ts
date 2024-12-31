import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { TMP_DIR, TMP_PATCH_DIR } from '../globals';
import { sha1 } from './fileService';

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

    public createPatchCache(file: {
        originalDiff: string;
        acceptedDiff: string;
        ignoredDiff?: string;
        filePath: string;
    }) {
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

    public getFileCache(hash: string) {
        return this.files[hash];
    }

    public clearFileCache(hash: string) {
        const file = this.getFileCache(hash);
        if (!file) return false;

        unlinkSync(file.originalState.cacheFilePath);
        unlinkSync(file.acceptedChanges.cacheFilePath);
        if (file.ignoredChanges) unlinkSync(file.ignoredChanges.cacheFilePath);
    }
}

export { CacheStore };
