import {MessageRepo} from 'database';
import {Queue} from 'bullmq';
import {log, loggerAls} from '../logger';
import {Queues, uuid, WithDatatypeSchema} from 'common';
import {fileSystem} from '../utils';

/**
 * @param repo The repository for the Receiver entity.
 * @param personalisationQueue The queue for the personalisation service.
 * @returns The acceptance service.
 */
export const acceptanceService = (msgRepo: MessageRepo, personalisationQueue: Queue<Queues['personalisation']['jobData']>) => {
    return {
        addToQueueByNumber: async (msgNumber: number) => {
            const item = await msgRepo.getByMsgNumber(msgNumber);

            if (item) {
                const alsRequestId = loggerAls.read('requestId');
                const requestId = uuid.generateIf(alsRequestId);

                await personalisationQueue.add('personalisation', {
                    datatype: item.datatype,
                    requestId: requestId,
                    data: item.data,
                    databaseId: item._id.toString(),
                });

                return {msg: `Item number ${item.msgNumber}, _id: ${item._id.toString()} added to personalisation queue`};
            } else {
                log.error('addToQueueByNumber: item not found');
                return {msg: 'Item not found'};
            }
        },
        addToQueueByNumberRange: async (msgNumberFrom: number, msgNumberTo: number) => {
            const items = await msgRepo.getFromToMsgNumber(msgNumberFrom, msgNumberTo);

            if (items.length > 0) {
                const alsRequestId = loggerAls.read('requestId');
                const requestId = uuid.generateIf(alsRequestId);

                for (const item of items) {
                    await personalisationQueue.add('personalisation', {
                        datatype: item.datatype,
                        requestId: requestId,
                        data: item.data,
                        databaseId: item._id.toString(),
                    });
                }

                return {
                    msg: `Items [${items.map((i) => ({
                        msgNumber: i.msgNumber,
                        _id: i._id.toString(),
                    }))}] added to personalisation queue`,
                };
            } else {
                log.error('addToQueueByNumberRange: items not found');
                return {msg: 'Items not found'};
            }
        },
        receive: async (data: unknown) => {
            log.info(`receive start`);

            const alsRequestId = loggerAls.read('requestId');
            const requestId = uuid.generateIf(alsRequestId);

            log.info(`alsRequestId: ${requestId}, queue requestId: ${requestId}`);

            const parse = WithDatatypeSchema.safeParse(data);

            if (parse.success) {
                log.info(`parse success, datatype: ${parse.data.datatype}`);

                const save = await msgRepo.chunkSave(data, parse.data.datatype);

                await personalisationQueue.add('personalisation', {
                    datatype: parse.data.datatype,
                    requestId,
                    data: data,
                    databaseId: save.insertedId.toString(),
                });

                await fileSystem.saveFile(data, parse.data.datatype);
            } else {
                log.info(`unknown 'datatype' detected`);

                const save = await msgRepo.chunkSave(data, 'unknown');

                await personalisationQueue.add('personalisation', {
                    datatype: 'unknown',
                    requestId,
                    data: data,
                    databaseId: save.insertedId.toString(),
                });

                await fileSystem.saveFile(data, 'unknown');
            }
        },
    };
};

export type AcceptanceService = ReturnType<typeof acceptanceService>;
