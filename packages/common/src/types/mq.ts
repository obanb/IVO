import {WithDatatype} from './schemas';

export type Msg<Data> = {
    requestId: string;
} & Data;

export type Queues = {
    personalisation: {
        jobData: Msg<WithDatatype & {data: unknown}>;
    };
};
