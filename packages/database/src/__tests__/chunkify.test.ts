import {chunkify} from '../utils';

const fs = require('fs');
const path = require('path');

describe('chunkify tests', () => {
    it('should chunkify and rebuild and compare with original', async () => {
        const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, 'largeJson.json'), 'utf8'));

        const chunks = chunkify.toChunks(JSON.stringify(jsonData), 1);

        expect(chunks.length).toBe(4);

        const rebuild = chunkify.fromChunks(chunks);

        expect(JSON.stringify(jsonData)).toBe(rebuild);
    });
});
