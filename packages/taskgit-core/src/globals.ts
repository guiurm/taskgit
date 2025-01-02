import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rf } from './services/fileService';

const TMP_DIR = join(tmpdir(), 'taskgit');
const TMP_PATCH_DIR = join(TMP_DIR, 'patch');

const pkg = JSON.parse(rf(join(fileURLToPath(import.meta.url), '..', '..', './package.json')));

const NAME = pkg.name;
const VERSION = pkg.version;
const VERSION_NAME = `${NAME}@${VERSION}`;

const IS_DEV = ['dev', 'development'].includes(process.env.NODE_ENV as string);
const IS_PROD = ['production', 'prod', 'staging', 'stg', 'stage'].includes(process.env.NODE_ENV as string);
const IS_TEST = process.env.NODE_ENV === 'test';

const LOG_SPLITTER = '_$ ò $_';

export { IS_DEV, IS_PROD, IS_TEST, LOG_SPLITTER, NAME, TMP_DIR, TMP_PATCH_DIR, VERSION, VERSION_NAME };
