import {Request, Response} from "express";
import {connect, repo} from "database";
import {acceptanceService} from "./acceptance";
import {Queue} from "bullmq";

const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT;

const redisCfg = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
}


export const startServer = async() => {
    const cosmosDbClient =  connect.getDbClient().cosmosDb();
    const client = await cosmosDbClient.connect();

    const db = client.db("orea");

    const personalisationQueue =  new Queue('personalisation', { connection: {
            host: redisCfg.host,
            port: parseInt(redisCfg.port!),
        }});


    const receiverRepository = repo.receiver(db);

    const as = acceptanceService(receiverRepository, personalisationQueue);


    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });

    app.use(express.json());

    app.get('/', (req: Request, res: Response) => {
        res.send('Express + TypeScript Server');
    });

    app.post('/income', async(req: Request, res: Response) => {
        const b = req.body;
        console.log(b)
        await as.receive(b)
        res.send('saved');
    });

}
