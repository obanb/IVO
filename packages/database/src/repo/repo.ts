import {Db, InsertOneResult, Document, ObjectId, WithId} from 'mongodb';
import {SortedMessage, SortedMessageChunk, SortedMessageSchema} from './schemas';
import {Readable} from 'stream';
import {gridFsService} from './gridFs';
import {chunkify} from '../utils';

export type ReceiverRepo = {
    rawSave: (obj: unknown) => Promise<InsertOneResult<Document>>;
    chunkSave: (obj: unknown) => Promise<InsertOneResult<Document>>;
    findById: (id: ObjectId) => Promise<WithId<SortedMessage> | null>;
    chunkRead: (parentId: ObjectId) => Promise<WithId<SortedMessage> | null>;
    rawSaveGrid: (obj: unknown) => Promise<ObjectId>;
    sortedSave: (obj: any) => Promise<InsertOneResult<Document>>;
};

const receiver = (db: Db): ReceiverRepo => {
    const self = receiver(db);

    return {
        rawSave: async (obj: any) => {
            const col = db.collection('rawMessages');
            const ins = await col.insertOne(obj);
            return ins;
        },
        chunkSave: async (obj: any, chunkMbSize = 1.5) => {
            const s = JSON.stringify(obj);
            if (chunkify.checkTrashold(s, chunkMbSize)) {
                const col = db.collection('rawMessages');
                const ins = await col.insertOne(obj);
                return ins;
            } else {
                const chunks = chunkify.toChunks(s, chunkMbSize);
                const parent = db.collection('rawMessages');
                const childs = db.collection<SortedMessageChunk>('rawMessagesChunks');

                const ins = await parent.insertOne({parent: 'xz'});

                chunks.forEach((chunk, i) => {
                    // TODO udelat sekvencne
                    void childs.insertOne({data: chunk, parent: ins.insertedId, index: i});
                });

                return ins;
            }
        },
        findById: async (id: ObjectId) => {
            const col = db.collection('rawMessages');
            const doc = await col.findOne<WithId<SortedMessage>>({_id: id});

            if (doc && doc.chunks) {
                const rebuild = await self.chunkRead(id);
                return rebuild;
            }

            return doc;
        },
        chunkRead: async (parentId: ObjectId) => {
            const parent = db.collection('rawMessages');
            const childs = db.collection('rawMessagesChunks');

            const parentDoc = await parent.findOne<WithId<SortedMessage>>({_id: parentId});

            if (parentDoc) {
                const childDocs = await childs.find({parent: parentId}).sort({index: 1}).toArray();

                const chunks = childDocs.map((doc) => doc.data);
                const s = chunkify.fromChunks(chunks);
                const obj = JSON.parse(s);
                return {
                    ...parentDoc,
                    data: obj,
                };
            }

            return null;
        },
        rawSaveGrid: async (obj: unknown) => {
            const readable = Readable.from(JSON.stringify(obj));
            const oid = await gridFsService(db).saveImage(readable, 'xyz', 'rawMessagesGrid');
            return oid;
        },
        sortedSave: async <Msg extends SortedMessage>(obj: Msg) => {
            SortedMessageSchema.parse(obj);

            const col = db.collection('sortedSave');
            const ins = await col.insertOne(obj);
            return ins;
        },
    };
};

export const repo = {
    receiver,
};
