import {log} from '../logger';
import axios from 'axios';
import axiosRetry from 'axios-retry';

const MY_STAY_CALL_URL = process.env.MY_STAY_CALL_URL;

export const mystayService = () => {
    return {
        call: async (data: unknown) => {
            log.info(`call`);

            const axiosInst = axios.create({
                timeout: 5000,
            });

            axiosRetry(axiosInst, {
                retries: 3,
                retryDelay: (retries) => {
                    return 1000 * retries;
                },
            });

            try {
                const res = await axios.post(MY_STAY_CALL_URL!, data);
                return res;
            } catch (error: any) {
                if (axios.isAxiosError(error)) {
                    log.error('MyStay call axios error:', error.message);
                } else {
                    log.error('MyStay call HTTP error:', error.response.status);
                }

                throw error;
            }
        },
    };
};
