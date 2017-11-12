const mongoose = require('mongoose');
const logger = require('./logger');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE_URI, { useMongoClient: true })
  .then(() => logger.info('Connected to database'))
  .catch((err) => {
    logger.error('Database connection error', err);
    process.exit(1);
  });
