import {Router, Request, Response} from 'express';
import {log} from '../logger';
import {AcceptanceService} from '../acceptance';
import {z} from 'zod';
import {ResendByNumberRequest, ResendByNumberRequestSchema, ResendByRangeRequest, ResendByRangeRequestSchema} from './schemas';

export const router = (acceptanceService: AcceptanceService) => {
    const expressRouter = Router();

    expressRouter.post('/api/hoteltime', async (req: Request, res: Response) => {
        log.info(`POST /api/hoteltime`);

        const body: unknown = req.body;

        // TODO domluvit se kdy rekneme 200 / pockat na queue zarazeni / pockat na save / ihned
        await acceptanceService.receive(body);

        res.sendStatus(200);
    });

    expressRouter.post('/api/service/resendByNumber', async (req: Request, res: Response) => {
        log.info(`POST /api/service/resend`);

        const body = req.body;

        const add = await acceptanceService.addToQueueByNumber(body);

        res.status(200).send(add);

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

    expressRouter.post('/api/service/resendByRange', async (req: Request, res: Response) => {
        log.info(`POST /hoteltime`);

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
