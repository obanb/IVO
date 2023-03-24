import {Db, ObjectId, WithId} from 'mongodb';
import {SortedMessage} from './schemas';

const messageCollectionName = 'messages';

export type AckRepo = {
    findById: (id: ObjectId) => Promise<WithId<SortedMessage> | null>;
    ackPersonalisation: (id: ObjectId) => Promise<boolean>;
    ackOds: (id: ObjectId) => Promise<boolean>;
    ackFs: (id: ObjectId) => Promise<boolean>;
};

export const ackRepo = (db: Db): AckRepo => {
    const messageColl = db.collection<WithId<SortedMessage>>(messageCollectionName);

    return {
        findById: async (id: ObjectId) => {
            const doc = await messageColl.findOne({_id: id});
            return doc;
        },
        ackPersonalisation: async (id: ObjectId) => {
            const upd = await messageColl.findOneAndUpdate({_id: id}, {$set: {personalisation: true}});
            return !!upd.ok;
        },
        ackOds: async (id: ObjectId) => {
            const upd = await messageColl.findOneAndUpdate({_id: id}, {$set: {ods: true}});
            return !!upd.ok;
        },
        ackFs: async (id: ObjectId) => {
            const upd = await messageColl.findOneAndUpdate({_id: id}, {$set: {fs: true}});
            return !!upd.ok;
        },
    };
};
