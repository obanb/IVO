import {Request, Response} from 'express';
import {bullmq} from './connectors';
import {log} from './logger';

const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT;

const redisCfg = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
};

export const startServer = async () => {
    app.listen(port, () => {
        log.info(`[server]: Server is running at http://localhost:${port}`);
    });

    await bullmq.subscribe();

    app.use(express.json());

    app.get('/', (req: Request, res: Response) => {
        res.send('Express + TypeScript Server');
    });
};
