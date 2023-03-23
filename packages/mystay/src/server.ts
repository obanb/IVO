import {Request, Response} from 'express';
import {log} from './logger';

const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT;

export const startServer = async () => {
    app.listen(port, () => {
        log.info(`[server]: Server is running at http://localhost:${port}`);
    });

    app.use(express.json());

    app.get('/hello', (req: Request, res: Response) => {
        res.send('hello from mystay package');
    });
};
