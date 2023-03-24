import {Router, Request, Response} from 'express';
import {log} from './logger';
import {AcceptanceService} from './acceptance';

export const router = (acceptanceService: AcceptanceService) => {
    const expressRouter = Router();

    expressRouter.post('/api/hoteltime', async (req: Request, res: Response) => {
        log.info(`POST /hoteltime`);

        const body = req.body;

        // TODO - nejspis asynchronne, zalezi v jakem kroku rekneme OK
        await acceptanceService.receive(body);

        res.sendStatus(200);
    });

    return expressRouter;
};
