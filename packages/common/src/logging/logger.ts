import {createLogger, format, transports} from "winston";
import {AsyncLocalStorage} from "async_hooks";
import {NextFunction, Request, Response} from "express";
import {Als} from "./asyncLocalStorage";


const withAls = (als: Als) => format.printf(({ level, message, timestamp }) => {
    const store = als.readAll()
    const requestId = store ? store.requestId : '';
    return `${timestamp} [${requestId}] ${level}: ${message}`;
})

export const _logger = (als: Als) => createLogger({
    transports: [new transports.Console()],
    format: format.combine(
        format.colorize(),
        format.timestamp(),
        withAls(als)
    )
});
