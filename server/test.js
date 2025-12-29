import logger from './lib/logger.js';

import('@prisma/adapter-pg').then(mod => logger.info(Object.keys(mod)));