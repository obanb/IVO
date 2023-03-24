import {Server} from 'http';

export const gracefulShutdownSignals: NodeJS.Signals[] = ['SIGHUP', 'SIGINT', 'SIGTERM'];

export interface ServerStatus {
    isAlive: boolean;
    server: Server | undefined;
}

const startGracefulShutdown = (
    signal: NodeJS.Signals,
    shutdownPeriodSeconds: number,
    server: Server | undefined,
    cleanupCallback: (() => Promise<any>) | undefined,
    log: {
        info: (message: string) => void;
        warn: (message: string) => void;
    },
) => {
    log.info(`Got ${signal} signal for graceful shutdown.`);

    if (!server) {
        log.warn('server is undefined');
        cleanupCallback && void cleanupCallback();
        return;
    }

    server.getConnections((error, count) => {
        if (count || cleanupCallback) {
            log.info(`Server has either active connections or cleanup action is underway > Waiting ${shutdownPeriodSeconds} seconds before shutdown...`);
            cleanupCallback && void cleanupCallback();
            setTimeout(() => {
                log.info('Shutdown timeout finished.');
                log.info(`Gracefully shutting down...`);

                process.exit(0);
            }, shutdownPeriodSeconds * 1000);
        } else {
            log.info('Server has no active connections > closing immediately');
            process.exit(0);
        }
    });
};

export const withGracefulShutdown = (
    shutdownPeriodSeconds: number,
    serverStatus: ServerStatus,
    log: {
        info: (message: string) => void;
        warn: (message: string) => void;
    },
    cleanupCallback?: () => Promise<any>,
) => {
    gracefulShutdownSignals.forEach((signal) => {
        process.on(signal, () => {
            serverStatus.isAlive = false;
            startGracefulShutdown(signal, shutdownPeriodSeconds, serverStatus.server, cleanupCallback, log);
        });
    });
};

export const checkHealth = (serverStatus: ServerStatus) => (req: any, res: any) => {
    if (serverStatus.isAlive) {
        res.sendStatus(200);
    } else {
        res.sendStatus(503);
    }
};
