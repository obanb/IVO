import * as path from 'path';
import * as fs from 'fs';
import {log} from '../logger';

const OUTPUT_DIR = 'output';
const MODIFIED_OUTPUT_DIR = 'output/modified';
const FILENAME_PREFIX = 'BookingStatus';

const generateFileName = (prefix: string, datatype: string, inc: number) => {
    const now = new Date();
    const dateStr = `${now.getUTCFullYear()}${(now.getUTCMonth() + 1).toString().padStart(2, '0')}${now.getUTCDate().toString().padStart(2, '0')}`;
    const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}-${now.getUTCMinutes().toString().padStart(2, '0')}-${now
        .getUTCSeconds()
        .toString()
        .padStart(2, '0')}`;

    const filename = `${prefix}_${datatype}_${dateStr}-${timeStr}-${inc}.json`;

    return filename;
};

const saveFile = async (data: unknown, datatype: string) => {
    let DIR = OUTPUT_DIR;

    if (datatype === 'modified') {
        DIR = MODIFIED_OUTPUT_DIR;
    }

    for (let i = 0; ; ++i) {
        const filename = generateFileName(FILENAME_PREFIX, datatype, i);
        const fullFilePath = path.join(DIR, filename);

        if (!fs.existsSync(fullFilePath)) {
            await fs.promises.writeFile(fullFilePath, DIR);
            break;
        } else {
            log.error(`File ${filename} already exists in folder ${DIR}, trying next inc: ${i + 1}`);
        }
    }
};

export const fileSystem = {
    generateFileName,
    saveFile,
};
