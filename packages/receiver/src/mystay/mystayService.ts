import {log} from "../logger";
import axios from "axios";
import axiosRetry from "axios-retry";

export const mystayService = () => {
    return {
        call: async(data: unknown) => {
            log.info(`call`);

            const axiosInst = axios.create({
                timeout: 5000,
            });

            axiosRetry(axiosInst, {
                retries: 3,
                retryDelay: () => {
                    return 1000;
                },
            });

            const res = await axiosInst.post('http://example.com/api', data)


        }
    }
}