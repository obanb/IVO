import {Job, Worker} from 'bullmq';
import {log, loggerAls} from '../logger';
import {Queues} from 'common';
import {AckRepo} from 'database';
import {ObjectId} from 'mongodb';

const redisCfg = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
};

export const bullmq = {
    subscribe: async (repo: AckRepo) => {
        const queueName = 'personalisation';

        log.info(`Starting worker - subscribe to queue: ${queueName}`);

        const pw = new Worker(
            queueName,
            async (job: Job<Queues['personalisation']['jobData'], string>) => {
                log.info(`MQ msg received: ${JSON.stringify(job.data)}`);

                const requestId = job.data.requestId;

                await loggerAls.run({requestId}, async () => {
                    // TODO - logovat 15MB zrejme chtit nebudu
                    log.info(`MQ msg received: ${JSON.stringify(job.data)}`);
                    log.info(`MQ msg requestId: ${requestId}`);

                    await repo.ackPersonalisation(new ObjectId(job.data.databaseId));
                });
                return 'ok';
            },
            {
                concurrency: 1,
                connection: {
                    host: redisCfg.host,
                    port: parseInt(redisCfg.port!),
                },
                autorun: true,
            },
        );

        await pw.waitUntilReady();

        if (pw.isRunning()) {
            log.info(`Worker listening - queue: ${queueName}`);
        }

        return {
            personalisationWorker: pw,
        };
    },
};
