import * as path from 'path';
import * as fs from 'fs';
import {log} from '../logger';

const STORAGE_URL = 'xxx';
const OUTPUT_DIR = 'output';
const FILENAME_PREFIX = 'test';

const generateFileName = (prefix: string, type: string) => {
    const now = new Date();
    const dateStr = `${now.getUTCFullYear()}${(now.getUTCMonth() + 1).toString().padStart(2, '0')}${now.getUTCDate().toString().padStart(2, '0')}`;
    const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}-${now.getUTCMinutes().toString().padStart(2, '0')}-${now
        .getUTCSeconds()
        .toString()
        .padStart(2, '0')}`;

    const filename = `${prefix}_${type}_${dateStr}-${timeStr}-${'NEJAKY_ID'}.json`;

    return filename;
};

const saveFile = async (data: unknown, filename?: string) => {
    const fname = filename ?? generateFileName(FILENAME_PREFIX, 'test');
    const fullFilePath = path.join(OUTPUT_DIR, fname);

    if (fs.existsSync(fullFilePath)) {
        log.error(`File ${filename} already exists in folder ${OUTPUT_DIR}`);
        // TODO - zkusit vyssi cislo
        return;
    }

    try {
        await fs.promises.writeFile(fullFilePath, OUTPUT_DIR);
        log.info(`File ${filename} saved to folder ${OUTPUT_DIR}`);
    } catch (error) {
        log.error(`Error saving file ${filename} to folder ${OUTPUT_DIR}: ${error}`);
    }
};

export const fileSystem = {
    generateFileName,
    saveFile,
};
