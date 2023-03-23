import {Request, Response} from 'express';
import {connect, repo} from 'database';
import {acceptanceService} from './acceptance';
import {Queue} from 'bullmq';
import {log, loggerAls} from './logger';
import {randomUUID} from 'crypto';
import {ExpressAdapter} from '@bull-board/express';
import {createBullBoard} from '@bull-board/api';
import {BullMQAdapter} from '@bull-board/api/bullMQAdapter';
import {Queues} from 'common';
import {serve, setup} from 'swagger-ui-express';

const swaggerJsdoc = require('swagger-jsdoc');

const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT;

const redisCfg = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
};

const bullAdminRoute = '/bull/admin';

export const startServer = async () => {
    const cosmosDbClient = connect.getDbClient().cosmosDb();
    const client = await cosmosDbClient.connect();

    const db = client.db('orea');

    const personalisationQueue = new Queue<Queues['personalisation']['jobData']>('personalisation', {
        connection: {
            host: redisCfg.host,
            port: parseInt(redisCfg.port!),
        },
    });

    const receiverRepository = repo.receiver(db);

    const as = acceptanceService(receiverRepository, personalisationQueue);

    app.listen(port, () => {
        log.info(`[server]: Server is running at http://localhost:${port}`);
    });

    app.use(express.json({limit: '50mb'}));

    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath(bullAdminRoute);

    createBullBoard({
        queues: [new BullMQAdapter(personalisationQueue)],
        serverAdapter: serverAdapter,
    });

    app.use(bullAdminRoute, serverAdapter.getRouter());

    app.use(
        loggerAls.expressHook(() => {
            const requestId = randomUUID();
            return {requestId};
        }),
    );

    /**
     * @openapi
     *  /api/hoteltime:
     *    post:
     *      description: HotelTime receiver gateway
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              type: object
     *              properties:
     *                datatype:
     *                  type: string
     *                  example: "Created"
     *      responses:
     *        200:
     *          description: OK
     *        400:
     *          description: Bad Request
     */
    app.post('/api/hoteltime', async (req: Request, res: Response) => {
        log.info(`POST /hoteltime`);

        const b = req.body;

        // TODO - nejspis asynchronne, zalezi v jakem kroku rekneme OK
        await as.receive(b);

        res.sendStatus(200);
    });

    const options = {
        swaggerDefinition: {
            openapi: '3.0.0',
            info: {
                title: 'IVO',
                version: '0.0.0',
            },
        },
        apis: [__filename],
    };

    const specs = swaggerJsdoc(options);

    app.use('/api/docs', serve, setup(specs));
};
