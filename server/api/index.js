const router = require('express').Router();
const logger = require('../core/logger');

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

router.use('/auth', require('./auth'));
router.use('/books', require('./books'));
router.use('/trades', require('./trades'));
router.use('/users', require('./users'));

router.get('/', (req, res) => {
  res.send('The API says hello!');
});

router.use((err, req, res, next) => { // eslint-disable-line
  if (err.name === 'FormValidationError') {
    const response = {
      name: err.name,
      message: err.message,
    };
    response.errors = err.data.map((item) => {
      return {
        param: item.param,
        msg: item.msg,
      };
    });
    res.status(422).json(response);
    return;
  } else if (err.name === 'DatabaseError') {
    res.status(500).json(err);
    return;
  } else if (err.name === 'UnauthorizedError') {
    res.status(401).json(err);
    return;
  }

  logger.error('Express: UnhandledException', err);
  res.status(500).json({
    name: 'UnhandledException',
  });
});

router.use((req, res, next) => {
  logger.warn('Express:', `Error 404 - ${req.url}`);
  res.status(404);
  if (req.xhr) {
    res.json({
      name: 'Not Found',
    });
  } else {
    next();
  }
});

module.exports = router;
