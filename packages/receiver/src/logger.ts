import {Als, als, logger} from "common";

const loggerAls: Als<{requestId: string}>  = als<{requestId: string}>("logging");

export const log = logger(loggerAls);

