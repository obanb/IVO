import {Request, Response} from 'express';
import {connect, monitoringRepo} from 'database';

const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT;
const databaseUri = process.env.DATABASE_URI;

export const startServer = async () => {
    const cosmosDbClient = connect.getDbClient().cosmosDb(databaseUri!);
    const client = await cosmosDbClient.connect();
    const db = client.db('orea');

    const monRepo = monitoringRepo(db);

    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });

    app.use(express.json());

    app.get('/hello', (req: Request, res: Response) => {
        res.send('hello from monitoring package');
    });

    app.get('/totalSummary', async (req: Request, res: Response) => {
        const summary = await monRepo.totalSummary();
        res.send(summary);
    });
    app.get('/dailySummary', async (req: Request, res: Response) => {
        const summary = await monRepo.dailySummary();
        res.send(summary);
    });
};
