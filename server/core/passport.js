const crypto = require('crypto');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_KEY,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
  User.findOne({ provider: { $elemMatch: { github: profile.id } } }, (err, user) => {
    if (!user) {
      const password = crypto.randomBytes(64).toString('hex');
      const newUser = new User({
        username: profile.username,
        password_hash: password,
        provider: [{ github: profile.id }],
      });
      newUser.save().then(() => {
        done(null, newUser);
      }).catch(err => done(err));
    } else {
      done(null, user);
    }
  });
}));

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: process.env.TWITTER_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
  User.findOne({ provider: { $elemMatch: { twitter: profile.id } } }, (err, user) => {
    if (!user) {
      const password = crypto.randomBytes(64).toString('hex');
      const newUser = new User({
        username: profile.username,
        password_hash: password,
        provider: [{ twitter: profile.id }],
      });
      newUser.save().then(() => {
        done(null, newUser);
      }).catch(err => done(err));
    } else {
      done(null, user);
    }
  });
}));

module.exports = passport;