const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../core/logger');
const DatabaseError = require('../api/errors/DatabaseError');
const UnauthorizedError = require('../api/errors/UnauthorizedError');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  provider: {
    type: Array,
    required: false,
    default: [],
  },
});

UserSchema.methods.checkPassword = function checkPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password_hash).then((success) => {
      if (success) resolve();
      reject();
    }).catch(() => {
      reject();
    });
  });
};

UserSchema.statics.calculateHash = function calculateHash(password) {
  return bcrypt.hash(password, 10);
};

UserSchema.statics.create = function create(username, password) {
  return new Promise((resolve, reject) => {
    const user = new this();
    user.username = username;
    bcrypt.hash(password, 10).then((hash) => {
      user.password_hash = hash;
      user.save().then(() => {
        resolve(user);
      }).catch((err) => {
        logger.error(err);
        reject(err);
      });
    }).catch((err) => {
      logger.error(err);
      reject();
    });
  });
};

UserSchema.statics.findByUsername = function findByUsername(username) {
  return new Promise((resolve, reject) => {
    this.findOne({ username }).exec((err, user) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(user);
    });
  });
};

UserSchema.methods.generateJWT = function generateJWT() {
  return jwt.sign({
    id: this._id,
    username: this.username,
  }, process.env.SECRET);
};

UserSchema.methods.toAuthJSON = function toAuthJSON() {
  const res = { id: this._id };
  res.username = this.username;
  res.token = this.generateJWT();
  return res;
};

UserSchema.statics.login = function login(username, password) {
  return new Promise((resolve, reject) => {
    this.findByUsername(username).then((user) => {
      if (user) {
        user.checkPassword(password).then(() => {
          resolve(user.toAuthJSON());
        }).catch(() => {
          reject(new UnauthorizedError('Invalid Password'));
        });
      } else {
        this.create(username, password).then((newUser) => {
          resolve(newUser.toAuthJSON());
        }).catch((err) => {
          logger.info(err);
          reject(new DatabaseError('Error creating user'));
        });
      }
    }).catch((err) => {
      logger.info(err);
      reject(new DatabaseError('Error finding user'));
    });
  });
};

module.exports = mongoose.model('User', UserSchema);
