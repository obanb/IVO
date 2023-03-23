import {randomUUID} from 'crypto';

const generate = () => randomUUID();

const generateIf = (uuid?: string | null) => uuid ?? generate();

export const uuid = {
    generate,
    generateIf,
};
