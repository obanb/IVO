const toChunks = (s: string, maxMbSize: number) => {
    const chunkSize = maxMbSize * 1024 * 1024;
    const chunks = [];
    for (let i = 0; i < s.length; i += chunkSize) {
        const chunk = s.slice(i, i + chunkSize);
        chunks.push(chunk);
    }

    return chunks;
};

const fromChunks = (chunks: string[]) => {
    return chunks.join('');
};

const getStringBytSize = (s: string) => {
    const byteSize = Buffer.byteLength(s, 'utf8');
    return byteSize;
};

const checkTrashold = (s: string, maxMbSize: number) => {
    const byteSize = getStringBytSize(s);
    const mbSize = byteSize / 1024 / 1024;
    return mbSize < maxMbSize;
};

export const chunkify = {
    toChunks,
    fromChunks,
    getStringBytSize,
    checkTrashold,
};
