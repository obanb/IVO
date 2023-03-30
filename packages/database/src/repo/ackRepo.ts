import {Db, ObjectId, WithId} from 'mongodb';
import {SortedMessage} from './schemas';

const messageCollectionName = 'messages';

export type AckRepo = {
    findById: (id: ObjectId) => Promise<WithId<SortedMessage> | null>;
    ackPersonalisation: (id: ObjectId) => Promise<boolean>;
    ackMyStay: (id: ObjectId) => Promise<boolean>;
    ackFs: (id: ObjectId) => Promise<boolean>;
    nack: (id: ObjectId, error: string) => Promise<boolean>;
};

export const ackRepo = (db: Db): AckRepo => {
    const messageColl = db.collection<SortedMessage>(messageCollectionName);

    return {
        findById: async (id: ObjectId) => {
            const doc = await messageColl.findOne({_id: id});
            return doc;
        },
        ackPersonalisation: async (id: ObjectId) => {
            const upd = await messageColl.findOneAndUpdate({_id: id}, {$set: {personalisation: true}});
            return !!upd.ok;
        },
        ackMyStay: async (id: ObjectId) => {
            const upd = await messageColl.findOneAndUpdate({_id: id}, {$set: {mystay: true}});
            return !!upd.ok;
        },
        ackFs: async (id: ObjectId) => {
            const upd = await messageColl.findOneAndUpdate({_id: id}, {$set: {fs: true}});
            return !!upd.ok;
        },
        nack: async (id: ObjectId, error: string) => {
            const upd = await messageColl.findOneAndUpdate({_id: id}, {$push: {errors: error}, $set: {error: true}});
            return !!upd.ok;
        },
    };
};
