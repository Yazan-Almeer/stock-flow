import app from './app';
import { env } from './config/env';
import logger from './config/logger';

const PORT = env.PORT || 3001;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});
