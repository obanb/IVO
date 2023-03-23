import {Db, GridFSBucket, ObjectId} from 'mongodb';
import {Readable} from 'stream';
import {log} from '../logger';

let bucket: GridFSBucket;
const getBucket = (db: Db, bucketName: string) => {
    if (!bucket) {
        bucket = new GridFSBucket(db, {bucketName: bucketName});
    }
    return bucket;
};

export const gridFsService = (db: Db) => ({
    delete: async (id: ObjectId, bucketName: string) => {
        const bucket = getBucket(db, bucketName);
        await bucket.delete(id);
    },
    findOne: (filter: object, bucketName: string) => {
        const bucket = getBucket(db, bucketName);
        const cursor = bucket.find(filter);
        return cursor.next();
    },
    saveImage: (imageStream: Readable, bucketFileName: string, bucketName: string) => {
        log.info(`save image '${bucketFileName}'`);
        const bucket = getBucket(db, bucketName);
        return new Promise<ObjectId>((resolve, reject) => {
            const writable = bucket.openUploadStream(bucketFileName);
            writable.on('finish', <T extends {_id: ObjectId}>(doc: T) => {
                log.debug(`${bucketFileName} saved successfully, id: ${doc._id}`);
                resolve(doc._id);
            });
            writable.on('error', (error) => {
                if (!imageStream.destroyed) {
                    imageStream.destroy(error);
                }
                log.error(`saving image '${bucketFileName}' failed, e: ${error?.stack}`);
                reject(error);
            });

            imageStream.pipe(writable);
        });
    },
    downloadImage: (id: ObjectId, bucketName: string) => {
        const stream = getBucket(db, bucketName).openDownloadStream(id);
        stream.on('error', (err) => {
            log.error(`download image failed, err: ${err?.stack}`);
        });
        return stream;
    },
});

export type GridFsService = ReturnType<typeof gridFsService>;
