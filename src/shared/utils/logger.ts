import path from 'path';
import { env } from '@config';
import pino, { Logger as PinoLogger, LoggerOptions } from 'pino';

interface LoggerContext {
  context?: string;
  [key: string]: unknown;
}

class LoggerService {
  private static instance: LoggerService;
  private readonly baseLogger: PinoLogger;

  private constructor() {
    this.baseLogger = pino(this.getLoggerConfig());
  }

  public static getInstance(): LoggerService {
    if (!this.instance) this.instance = new LoggerService();
    return this.instance;
  }

  private getLoggerConfig(): LoggerOptions {
    const isProd = env.NODE_ENV === 'production';

    return {
      name: env.NODE_ENV || 'api',
      level: isProd ? 'info' : 'debug',
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: (label) => ({ level: label }),
        bindings: ({ pid, hostname }) => ({ pid, host: hostname, node_version: process.version }),
      },
      redact: {
        paths: [
          'password',
          'token',
          'accessToken',
          'refreshToken',
          'authorization',
          'cookie',
          'apiKey',
          'secret',
          '*.password',
          '*.token',
          '*.accessToken',
          '*.refreshToken',
          '*.authorization',
          '*.cookie',
          '*.apiKey',
          '*.secret',
          'req.headers.authorization',
          'req.headers.cookie',
        ],
        censor: '[REDACTED]',
      },
      serializers: {
        error: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
      },
      transport: isProd ? this.getProductionTransport() : this.getDevelopmentTransport(),
    };
  }

  private getProductionTransport() {
    const logDir = env.LOG_DIR || path.join(process.cwd(), 'logs');

    return {
      target: 'pino/file',
      options: {
        destination: path.join(logDir, 'app.log'),
        mkdir: true,
      },
    };
  }

  private getDevelopmentTransport() {
    return {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
        singleLine: false,
        levelFirst: true,
        messageFormat: '{context} - {msg}',
      },
    };
  }

  public createLogger(context?: string | LoggerContext): Logger {
    return new Logger(this.baseLogger, context);
  }

  public getBaseLogger(): PinoLogger {
    return this.baseLogger;
  }
}

export class Logger {
  constructor(
    private logger: PinoLogger,
    context?: string | LoggerContext,
  ) {
    if (context) {
      const ctx = typeof context === 'string' ? { context } : context;
      this.logger = logger.child(ctx);
    }
  }

  private sanitize(meta?: unknown) {
    if (!meta) return {};
    return typeof meta === 'object' && meta !== null ? meta : { data: meta };
  }

  private format(msg: string, meta?: unknown) {
    return [this.sanitize(meta), msg] as const;
  }

  trace(msg: string, meta?: unknown) {
    this.logger.trace(...this.format(msg, meta));
  }
  debug(msg: string, meta?: unknown) {
    this.logger.debug(...this.format(msg, meta));
  }
  info(msg: string, meta?: unknown) {
    this.logger.info(...this.format(msg, meta));
  }
  warn(msg: string, meta?: unknown) {
    this.logger.warn(...this.format(msg, meta));
  }
  error(msg: string, meta?: unknown) {
    this.logger.error(...this.format(msg, meta));
  }
  fatal(msg: string, meta?: unknown) {
    this.logger.fatal(...this.format(msg, meta));
  }

  child(context: string | LoggerContext): Logger {
    const ctx = typeof context === 'string' ? { context } : context;
    return new Logger(this.logger.child(ctx));
  }

  withUser(userId: string): Logger {
    return this.child({ userId });
  }
}

const loggerService = LoggerService.getInstance();
export const logger = loggerService.createLogger();
export const createLogger = (context: string | LoggerContext) => loggerService.createLogger(context);
export const getBaseLogger = () => loggerService.getBaseLogger();
