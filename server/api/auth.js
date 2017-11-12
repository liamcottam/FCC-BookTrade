const router = require('express').Router();
const FormValidationError = require('./errors/FormValidationError');

const logger = require('../core/logger');
const passport = require('../core/passport');
const User = require('../models/User');
const Token = require('../models/Token');

router.post('/', (req, res, next) => {
  req.assert('username', 'is required').notEmpty();
  req.assert('password', 'is required').notEmpty();
  req.assert('username', 'needs to be a string').isString();
  req.assert('password', 'needs to be a string').isString();
  req.assert('username', 'requires between 1 to 16 characters').len(1, 16);
  req.assert('password', 'requires between 6 to 128 characters').len(6, 128);

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) throw new FormValidationError(result.array());
    return User.login(req.sanitize('username').trim(), req.sanitize('password').trim());
  }).then((authJSON) => {
    res.json(authJSON);
  }).catch(next);
});

router.post('/token', (req, res, next) => {
  req.assert('id', 'required').notEmpty();
  req.assert('token', 'required').notEmpty();

  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) return res.status(401).json({ error: 'Invalid Data' });
      return Token.findOneAndRemove({ _id: req.body.id, token: req.body.token }).exec();
    }).then((token) => {
      if (token) {
        return res.json(token.value);
      }
      return res.status(401).json({ error: 'Invalid Data' });
    }).catch(next);
});

router.get('/github', passport.authenticate('github'));
router.get('/twitter', passport.authenticate('twitter'));

router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', (err, user) => {
    logger.error(err);
    if (err) return res.status(401).json({ error: 'Not Authenticated' });
    req.login(user, (err) => {
      logger.error(err);
      if (err) {
        res.status(401).json({ error: 'Not Authenticated' });
        return;
      }
      Token.createToken(user.toAuthJSON()).then((token) => {
        res.redirect(`/auth?id=${token.id}&token=${token.token}`);
      }).catch((err) => {
        logger.error(err);
        res.status(401).json({ error: 'Not Authenticated' });
      });
    });
  })(req, res, next);
});

router.get('/twitter/callback', (req, res, next) => {
  passport.authenticate('twitter', (err, user) => {
    logger.error(err);
    if (err) return res.status(401).json({ error: 'Not Authenticated' });
    req.login(user, (err) => {
      logger.error(err);
      if (err) {
        res.status(401).json({ error: 'Not Authenticated' });
        return;
      }
      Token.createToken(user.toAuthJSON()).then((token) => {
        res.redirect(`/auth?id=${token.id}&token=${token.token}`);
      }).catch((err) => {
        logger.error(err);
        res.status(401).json({ error: 'Not Authenticated' });
      });
    });
  })(req, res, next);
});

module.exports = router;
