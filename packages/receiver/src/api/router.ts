import {Router, Request, Response} from 'express';
import {log} from '../logger';
import {AcceptanceService} from '../acceptance';
import {z} from 'zod';
import {ResendByNumberRequest, ResendByNumberRequestSchema, ResendByRangeRequest, ResendByRangeRequestSchema} from './schemas';
import {basicAuth} from 'common';

const dotenv = require('dotenv');

dotenv.config();

const adminCredentials = {
    username: process.env.ADMIN_USERNAME!,
    password: process.env.ADMIN_PASSWORD!,
};

export const router = (acceptanceService: AcceptanceService) => {
    const expressRouter = Router();

    const basicAuthMiddleware = basicAuth(adminCredentials);

    expressRouter.post('/api/hoteltime', async (req: Request, res: Response) => {
        log.info(`POST /api/hoteltime`);

        const body: unknown = req.body;

        await acceptanceService.receive(body);

        res.sendStatus(200);
    });

    expressRouter.post('/api/service/token', (req, res) => {
        log.info(`POST /api/service/token`);

        const {username, password} = req.body;

        if (!username || !password) {
            return res.status(400).send('Username and password are required.');
        }

        const token = Buffer.from(`${username}:${password}`).toString('base64');
        const basicAuthToken = `Basic ${token}`;

        res.json({token: basicAuthToken});
    });

    expressRouter.post('/api/service/resendByNumber', basicAuthMiddleware, async (req: Request, res: Response) => {
        log.info(`POST /api/service/resendByNumber`);

        try {
            const {number}: ResendByNumberRequest = ResendByNumberRequestSchema.parse(req.body);

            const add = await acceptanceService.addToQueueByNumber(number);

            res.status(200).send(add);
        } catch (e) {
            if (e instanceof z.ZodError) {
                res.status(400).json({success: false, message: 'Validation error', errors: e.flatten()});
            } else {
                res.status(500).json({success: false, message: 'Internal server error'});
            }
        }
    });

    expressRouter.post('/api/service/resendByRange', basicAuthMiddleware, async (req: Request, res: Response) => {
        log.info(`POST /api/service/resendByRange`);

        try {
            const {from, to}: ResendByRangeRequest = ResendByRangeRequestSchema.parse(req.body);

            const add = await acceptanceService.addToQueueByNumberRange(from, to);

            res.status(200).send(add);
        } catch (e) {
            if (e instanceof z.ZodError) {
                res.status(400).json({success: false, message: 'Validation error', errors: e.flatten()});
            } else {
                res.status(500).json({success: false, message: 'Internal server error'});
            }
        }
    });

    return expressRouter;
};
