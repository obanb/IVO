import {Db, ObjectId} from 'mongodb';
import {MonitoringSummary, SortedMessage} from './schemas';

const messageCollectionName = 'messages';

export type MonitoringRepo = {
    totalSummary: () => Promise<MonitoringSummary>;
    dailySummary: () => Promise<MonitoringSummary>;
};

const summaryPipeline = [
    {
        $group: {
            _id: null,
            totalCount: {$sum: 1},
            ack: {
                $sum: {
                    $cond: ['$ack', 1, 0],
                },
            },
            fs: {
                $sum: {
                    $cond: ['$fs', 1, 0],
                },
            },
            ods: {
                $sum: {
                    $cond: ['$ods', 1, 0],
                },
            },
        },
    },
    {
        $project: {
            _id: 0,
            totalCount: 1,
            ack: 1,
            fs: 1,
            ods: 1,
        },
    },
];

export const monitoringRepo = (db: Db): MonitoringRepo => {
    const messageColl = db.collection<SortedMessage>(messageCollectionName);

    return {
        totalSummary: async () => {
            const agg = await messageColl.aggregate<MonitoringSummary>(summaryPipeline).toArray();

            return agg[0];
        },
        dailySummary: async () => {
            const currentDate = new Date();
            const last24Hours = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
            const agg = await messageColl
                .aggregate<MonitoringSummary>([{$match: {_id: {$gte: ObjectId.createFromTime(last24Hours.getTime() / 1000)}}}, ...summaryPipeline])
                .toArray();

            return agg[0];
        },
    };
};
