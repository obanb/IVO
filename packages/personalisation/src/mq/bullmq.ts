import {Job, Worker} from 'bullmq';
import {log, loggerAls} from '../logger';
import {Queues} from 'common';
import {AckRepo} from 'database';
import {mystayService} from '../mystay';

const redisCfg = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PSWD,
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
                    log.info(`MQ msg requestId: ${requestId}`);
                    log.info(`MQ msg received: ${JSON.stringify(job.data)}`);

                    await mystayService(repo).call(job.data.data, job.data.databaseId);
                });
                return 'ok';
            },
            {
                concurrency: 1,
                connection: {
                    host: redisCfg.host,
                    port: parseInt(redisCfg.port!),
                    password: redisCfg.password,
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
