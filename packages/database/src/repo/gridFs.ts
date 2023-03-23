import {GridFSBucket} from 'mongodb';
import {Types} from 'mongoose';
import * as mongoose from 'mongoose';
import {Readable} from 'stream';
import {getLogger} from '../../utils';
import {PRVNI_PARALELNI_PRIPOJENI_FORM_COLLECTION_NAME} from './PrvniParalelniPripojeniForm';

const log = getLogger('odstavky.PrvniParalelniPripojeniGridFs');

let bucket: GridFSBucket;
const getBucket = () => {
    if (!bucket) {
        bucket = new GridFSBucket(mongoose.connection.db, {bucketName: PRVNI_PARALELNI_PRIPOJENI_FORM_COLLECTION_NAME});
    }
    return bucket;
};

export const PrvniParalelniPripojeniGridFs = {
    delete: (id: Types.ObjectId) => {
        const bucket = getBucket();
        return new Promise<void>((resolve, reject) => {
            bucket.delete(id, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    },
    findOne: (filter: object) => {
        const bucket = getBucket();
        const cursor = bucket.find(filter);
        return cursor.next();
    },
    saveImage: (imageStream: Readable, bucketFileName: string) => {
        log.debug(`save image '${bucketFileName}'`);
        const bucket = getBucket();
        return new Promise<Types.ObjectId>((resolve, reject) => {
            const writable = bucket.openUploadStream(bucketFileName);
            writable.on('finish', <T extends {_id: Types.ObjectId}>(doc: T) => {
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
    downloadImage: (id: Types.ObjectId) => {
        const stream = getBucket().openDownloadStream(id);
        stream.on('error', (err) => {
            log.error(`download image failed, err: ${err?.stack}`);
        });
        return stream;
    },
};
