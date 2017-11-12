const express = require('express');
const passport = require('passport');
const compress = require('compression');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const api = require('../api');

const app = express();
const server = require('http').Server(app);

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.set('trust proxy', 1);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compress({ threshold: 0 }));
// app.use(passport.session());
app.use(passport.initialize());
app.use(expressValidator({
  customValidators: {
    isString(value) {
      return typeof value === 'string';
    },
  },
}));
app.use('/api/v1', api);

app.use((err, req, res, next) => { // eslint-disable-line
  if (req.xhr) {
    const response = { name: 'Bad Request' };
    if (err.name === 'SyntaxError') response.message = err.message;
    return res.status(400).json(response);
  }
  return res.status(400).send('Bad Request');
});

module.exports = { express: app, server };
