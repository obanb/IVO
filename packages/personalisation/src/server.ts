import {Request, Response} from 'express';
import {log} from './logger';
import {Server} from 'node:http';
import {checkHealth, ServerStatus, withGracefulShutdown} from 'common';
import {bullmq} from './mq';
import {ackRepo, connect} from 'database';

const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT;
const databaseUri = process.env.DATABASE_URI;

const serverStatus: ServerStatus = {isAlive: true, server: undefined};

export const startServer = async () => {
    // db init
    const cosmosDbClient = connect.getDbClient().cosmosDb(databaseUri!);
    const client = await cosmosDbClient.connect();
    const db = client.db('orea');

    serverStatus.server = await new Promise<Server>((resolve) => {
        const httpServer = app.listen(port, () => {
            log.info(`[server]: Server is running at http://localhost:${port}`);
            resolve(httpServer);
        });
    });

    const repo = ackRepo(db);
    const {personalisationWorker} = await bullmq.subscribe(repo);

    app.use(express.json());

    app.get('/', (req: Request, res: Response) => {
        res.send('Express + TypeScript Server');
    });

    app.get('/healthz', checkHealth(serverStatus));

    withGracefulShutdown(Number(process.env.GRACEFUL_SHUTDOWN_PERIOD) || 30, serverStatus, log, async () => {
        await personalisationWorker.close();
    });
};
