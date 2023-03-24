import {Db, InsertOneResult, Document, ObjectId, WithId} from 'mongodb';
import {SortedMessage, SortedMessageChunk} from './schemas';
import {Readable} from 'stream';
import {gridFsService} from './gridFs';
import {chunkify} from '../utils';

const messageCollectionName = 'messages';
const messageChunksCollectionName = 'messageChunks';
const messageGridFSCollectionName = 'messageGrid';

export type MessageRepo = {
    save: (obj: unknown) => Promise<InsertOneResult<Document>>;
    chunkSave: (obj: unknown) => Promise<InsertOneResult<Document>>;
    findById: (id: ObjectId) => Promise<WithId<SortedMessage> | null>;
    chunkRead: (parentId: ObjectId) => Promise<WithId<SortedMessage> | null>;
    gridSave: (obj: unknown, filename: string) => Promise<ObjectId>;
};

export const messageRepo = (db: Db): MessageRepo => {
    const messageColl = db.collection<SortedMessage>(messageCollectionName);
    const messageChunkColl = db.collection<SortedMessageChunk>(messageChunksCollectionName);
    const messageGridFsColl = db.collection(messageGridFSCollectionName);

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
        chunkSave: async (obj: any, chunkMbSize = 1.5) => {
            const s = JSON.stringify(obj);
            if (chunkify.checkTrashold(s, chunkMbSize)) {
                const ins = await messageColl.insertOne(obj);
                return ins;
            } else {
                const chunks = chunkify.toChunks(s, chunkMbSize);

                const ins = await messageColl.insertOne({datatype: 'pes', chunks: true, ods: false, fs: false, personalisation: false});

                for await (const [index, chunk] of chunks.entries()) {
                    void messageChunkColl.insertOne({data: chunk, parent: ins.insertedId, index});
                }

                return ins;
            }
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
