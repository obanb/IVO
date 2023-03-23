import {ReceiverRepo} from 'database';
import {Queue} from 'bullmq';
import {log, loggerAls} from '../logger';
import {Queues, uuid, WithDatatypeSchema} from 'common';

/**
 * @param repo The repository for the Receiver entity.
 * @param personalisationQueue The queue for the personalisation service.
 * @returns The acceptance service.
 */
export const acceptanceService = (repo: ReceiverRepo, personalisationQueue: Queue<Queues['personalisation']['jobData']>) => {
    return {
        receive: async (data: unknown) => {
            log.info(`receive`);

            const alsRequestId = loggerAls.read('requestId');
            const requestId = uuid.generateIf(alsRequestId);

            log.info(`alsRequestId: ${requestId}, queue requestId: ${requestId}`);

            // await repo.rawSave(data);
            // await repo.rawSaveGrid(data);

            await repo.chunkSave(data);

            const parse = WithDatatypeSchema.safeParse(data);

            if (parse.success) {
                log.info(`parse success, datatype: ${parse.data.datatype}`);

                await personalisationQueue.add('personalisation', {
                    datatype: parse.data.datatype,
                    requestId,
                    data: parse.data,
                });
            } else {
                log.info(`unknown 'datatype' detected`);
            }

            //
            // try {
            //     const call = await mystayService().call(data);
            // }catch(e){
            //     // zapsat chybu
            // }
        },
    };
};
