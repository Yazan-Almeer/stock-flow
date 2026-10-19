import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'yyyy-mm-dd HH:MM:ss.l',
    },
  },
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

export default logger;
