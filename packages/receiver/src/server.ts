import {connect, messageRepo} from 'database';
import {acceptanceService} from './acceptance';
import {Queue} from 'bullmq';
import {log, loggerAls} from './logger';
import {randomUUID} from 'crypto';
import {ExpressAdapter} from '@bull-board/express';
import {createBullBoard} from '@bull-board/api';
import {BullMQAdapter} from '@bull-board/api/bullMQAdapter';
import {basicAuth, checkHealth, Queues, ServerStatus, withGracefulShutdown} from 'common';
import {serve, setup} from 'swagger-ui-express';
import {Server} from 'node:http';
import {router, swagger} from './api';

const swaggerJsdoc = require('swagger-jsdoc');

const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT;
const databaseUri = process.env.DATABASE_URI;

const redisCfg = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PSWD,
};

const adminCredentials = {
    username: process.env.ADMIN_USERNAME!,
    password: process.env.ADMIN_PASSWORD!,
}

const bullAdminRoute = '/api/service/bull/admin';

const serverStatus: ServerStatus = {isAlive: true, server: undefined};

const basicAuthMiddleware = basicAuth(adminCredentials);


export const startServer = async () => {
    // db init
    const cosmosDbClient = connect.getDbClient().cosmosDb(databaseUri!);
    const client = await cosmosDbClient.connect();
    const db = client.db('orea');

    // queues init
    const personalisationQueue = new Queue<Queues['personalisation']['jobData']>('personalisation', {
        connection: {
            host: redisCfg.host,
            port: parseInt(redisCfg.port!),
            password: redisCfg.password,
        },
    });

    const msgRepo = messageRepo(db);
    const as = acceptanceService(msgRepo, personalisationQueue);

    serverStatus.server = await new Promise<Server>((resolve) => {
        const httpServer = app.listen(port, () => {
            log.info(`[server]: Server is running at http://localhost:${port}`);
            resolve(httpServer);
        });
    });

    app.use(express.json({limit: '50mb'}));

    withGracefulShutdown(Number(process.env.GRACEFUL_SHUTDOWN_PERIOD) || 30, serverStatus, log);

    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath(bullAdminRoute);

    createBullBoard({
        queues: [new BullMQAdapter(personalisationQueue)],
        serverAdapter: serverAdapter,
    });

    app.use(bullAdminRoute, basicAuthMiddleware, serverAdapter.getRouter());

    app.use(
        loggerAls.expressHook(() => {
            const requestId = randomUUID();
            return {requestId};
        }),
    );

    app.use('/', router(as));
    app.get('/healthz', checkHealth(serverStatus));

    const specs = swaggerJsdoc(swagger.options);
    app.use(swagger.url, serve, setup(specs));
};
