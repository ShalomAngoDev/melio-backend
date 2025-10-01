import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pino from 'pino';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: pino.Logger;

  constructor(private readonly configService: ConfigService) {
    const logLevel = configService.get('LOG_LEVEL', 'info');
    const logFormat = configService.get('LOG_FORMAT', 'pretty');

    const options: pino.LoggerOptions = {
      level: logLevel,
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: (label) => ({ level: label }),
      },
    };

    if (logFormat === 'pretty' && process.env.NODE_ENV === 'development') {
      this.logger = pino(
        options,
        pino.destination({
          dest: 1, // stdout
          sync: false,
        }),
      );
    } else {
      this.logger = pino(options);
    }
  }

  log(message: any, context?: string) {
    this.logger.info({ context }, message);
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error({ context, trace }, message);
  }

  warn(message: any, context?: string) {
    this.logger.warn({ context }, message);
  }

  debug(message: any, context?: string) {
    this.logger.debug({ context }, message);
  }

  verbose(message: any, context?: string) {
    this.logger.trace({ context }, message);
  }
}
