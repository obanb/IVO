import {Db, InsertOneResult, ObjectId, WithId} from 'mongodb';
import {SortedMessage, SortedMessageChunk} from './schemas';
import {Readable} from 'stream';
import {gridFsService} from './gridFs';
import {chunkify} from '../utils';

const messageCollectionName = 'messages';
const messageChunksCollectionName = 'messageChunks';
const messageGridFSCollectionName = 'messageGrid';

export type MessageRepo = {
    save: (obj: unknown) => Promise<InsertOneResult<SortedMessage>>;
    chunkSave: (obj: unknown, datatype: string) => Promise<InsertOneResult<SortedMessage>>;
    findById: (id: ObjectId) => Promise<WithId<SortedMessage> | null>;
    getByMsgNumber: (msgNumber: number) => Promise<WithId<SortedMessage> | null>;
    getFromToMsgNumber: (from: number, to: number) => Promise<WithId<SortedMessage>[] | []>;
    chunkRead: (parentId: ObjectId) => Promise<WithId<SortedMessage> | null>;
    gridSave: (obj: unknown, filename: string) => Promise<ObjectId>;
};

export const messageRepo = (db: Db): MessageRepo => {
    const counterColl = db.collection<{msgNumber: number}>('counters');
    const messageColl = db.collection<SortedMessage>(messageCollectionName);
    const messageChunkColl = db.collection<SortedMessageChunk>(messageChunksCollectionName);

    async function getNextMsgValue() {
        const result = await counterColl.findOneAndUpdate({}, {$inc: {msgNumber: 1}}, {upsert: true, returnDocument: 'after'});

        return result.value?.msgNumber ?? 0;
    }

    const chunkRead = async (parentId: ObjectId) => {
        const parentDoc = await messageColl.findOne({_id: parentId});

        if (parentDoc) {
            const childDocs = await messageChunkColl.find({parent: parentId}).sort({index: 1}).toArray();

            const chunks = childDocs.map((doc) => doc.data);
            const s = chunkify.fromChunks(chunks);
            const obj = JSON.parse(s);
            return {
                ...parentDoc,
                data: obj,
            };
        }

        return null;
    };

    return {
        save: async (obj: any) => {
            const ins = await messageColl.insertOne(obj);
            return ins;
        },
        chunkSave: async (obj: unknown, datatype: string, chunkMbSize = 1.5) => {
            const s = JSON.stringify(obj);
            const msgNumber = await getNextMsgValue();

            if (chunkify.checkTrashold(s, chunkMbSize)) {
                const ins = await messageColl.insertOne({
                    datatype,
                    data: obj,
                    chunks: false,
                    msgNumber,
                    mystay: false,
                    fs: false,
                    personalisation: false,
                    error: false,
                    errors: [],
                });
                return ins;
            } else {
                const chunks = chunkify.toChunks(s, chunkMbSize);

                const ins = await messageColl.insertOne({
                    datatype,
                    chunks: true,
                    msgNumber,
                    mystay: false,
                    fs: false,
                    personalisation: false,
                    error: false,
                    errors: [],
                });

                for (const [index, chunk] of chunks.entries()) {
                    await messageChunkColl.insertOne({data: chunk, parent: ins.insertedId, index});
                }

                return ins;
            }
        },
        getByMsgNumber: async (msgNumber: number) => {
            const doc = await messageColl.findOne({msgNumber});

            if (doc && doc.chunks) {
                const rebuild = await chunkRead(doc._id);
                return rebuild;
            }

            return doc;
        },
        getFromToMsgNumber: async (from: number, to: number) => {
            const docs = await messageColl.find({msgNumber: {$gte: from, $lte: to}}).toArray();

            const rebuilds = await Promise.all(
                docs.map(async (doc) => {
                    if (doc.chunks) {
                        const rebuild = await chunkRead(doc._id);
                        return rebuild ?? doc;
                    }

                    return doc;
                }),
            );

            return rebuilds ?? [];
        },
        chunkRead,
        findById: async (id: ObjectId) => {
            const doc = await messageColl.findOne({_id: id});

            if (doc && doc.chunks) {
                const rebuild = await chunkRead(id);
                return rebuild;
            }

            return doc;
        },
        gridSave: async (obj: unknown, filename: string) => {
            const readable = Readable.from(JSON.stringify(obj));
            const oid = await gridFsService(db).saveImage(readable, filename, messageGridFSCollectionName);
            return oid;
        },
    };
};
