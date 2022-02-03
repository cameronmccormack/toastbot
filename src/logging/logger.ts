import * as winston from 'winston';

export class Logger {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
        });
        this.logger.add(new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }));
    }

    info(message: string, additional?: Record<string, unknown>): void {
        this.logger.log({
            level: 'info',
            message: message,
            ...additional
        })
    }
}