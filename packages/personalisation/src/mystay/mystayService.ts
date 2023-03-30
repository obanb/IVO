import {log} from '../logger';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import {AckRepo} from 'database';
import {ObjectId} from 'mongodb';

const MY_STAY_CALL_URL = process.env.MY_STAY_URL;

export const mystayService = (ackRepo: AckRepo) => {
    return {
        call: async (data: unknown, databaseId: string, retries: number = 0) => {
            log.info(`mystayService.call: databaseId: ${databaseId}, retries: ${retries}`);

            const axiosInst = axios.create({
                timeout: 5000,
            });

            axiosRetry(axiosInst, {
                retries,
                retryDelay: (retries) => {
                    return 1000 * retries;
                },
            });

            try {
                const res = await axios.post(MY_STAY_CALL_URL!, data);

                await ackRepo.ackMyStay(new ObjectId(databaseId));

                return res;
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    log.error('MyStay call axios error:', error.message);
                } else {
                    log.error('MyStay call HTTP error:', JSON.stringify(error));
                }

                await ackRepo.nack(new ObjectId(databaseId), JSON.stringify(error));

                throw error;
            }
        },
    };
};
