const router = require('express').Router();
const request = require('request');
const logger = require('../core/logger');
const auth = require('../core/auth');
const User = require('../models/User');
const Book = require('../models/Book');
const FormValidationError = require('./errors/FormValidationError');

router.get('/', (req, res, next) => {
  User.find({}, { username: 1 }).then((users) => {
    res.json(users);
  }).catch(next);
});

router.patch('/', auth.required, (req, res, next) => {
  const valid = ['name', 'city', 'state'];
  const update = {};
  valid.forEach((item) => {
    if (req.body[item]) update[item] = req.body[item];
    else update[item] = null;
  });
  User.findByIdAndUpdate(req.token.id, { $set: update }).then(() => {
    res.sendStatus(200);
  }).catch(next);
});

router.patch('/username', auth.required, (req, res, next) => {
  req.assert('username', 'is required').notEmpty();
  req.assert('username', 'needs to be a string').isString();
  req.assert('username', 'requires between 1 to 16 characters').len(3, 16);

  req.getValidationResult().then((result) => {
    if (result.isEmpty()) {
      User.findByIdAndUpdate(req.token.id, { $set: { username: req.body.username } }).then(() => {
        res.sendStatus(200);
      }).catch((err) => {
        if (err.code === 11000) {
          res.status(409).json({ msg: 'Username has been taken' });
        } else {
          next(err);
        }
      });
    } else {
      res.sendStatus(401);
    }
  }).catch(next);
});

router.patch('/password', auth.required, (req, res, next) => {
  req.assert('old_password', '6 to 128 characters required').len(6, 128);
  req.assert('new_password', '6 to 128 characters required').len(6, 128);

  req.getValidationResult().then((result) => {
    if (result.isEmpty()) {
      return User.findById(req.token.id).exec();
    }
    throw new FormValidationError(result.array());
  }).then((user) => {
    if (user) {
      // Check the password...
      user.checkPassword(req.body.old_password).then(() => {
        return User.calculateHash(req.body.new_password);
      }).then((hash) => {
        user.password_hash = hash;
        user.save().then(() => {
          res.sendStatus(200);
        }).catch(next);
      }).catch(() => {
        res.status(401).json({ msg: 'Invalid password' });
      });
    } else {
      res.status(401).json({ msg: 'User not found' });
    }
  }).catch(next);
});

router.get('/:username/books', (req, res, next) => {
  req.assert('username', 'required').notEmpty();

  req.getValidationResult().then((result) => {
    if (result.isEmpty()) {
      User.findByUsername(req.params.username).then((user) => {
        if (user) {
          Book.find({ owners: { $in: [user._id] } }, { _id: 0, __v: 0 })
            .sort({ lastModified: -1 })
            .then((books) => {
              res.json({
                profile: {
                  username: user.username,
                  name: user.name,
                  city: user.city,
                  state: user.state,
                },
                books,
              });
            }).catch(next);
        } else {
          res.status(404).json({ msg: 'User not found' });
        }
      }).catch(next);
    } else {
      res.status(404).json({ msg: 'User not found' });
    }
  }).catch(next);
});

function getBookFromRemote(id) {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'production') {
      request.get({
        url: `https://www.googleapis.com/books/v1/volumes/${id}?key=${process.env.GOOGLE_API_KEY}`,
        json: true,
      }, (err, response) => {
        if (err || response.statusCode !== 200) {
          logger.info(err || response.body);
          reject(new Error(err || response.body));
          return;
        }
        resolve(response.body);
      });
    } else {
      resolve(require('./examples/book_example_response')); // eslint-disable-line
    }
  });
}

router.post('/books', auth.required, (req, res, next) => {
  req.assert('id', 'required').notEmpty();

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) throw new FormValidationError(result.array());
    return User.findById(req.token.id);
  }).then((user) => {
    if (!user) throw new Error({ msg: 'user not found' });
    return new Promise((resolve, reject) => {
      Book.findOne({ id: req.body.id }, (err, book) => {
        if (!err) {
          if (book) {
            book.update({
              $addToSet: { owners: user._id },
              $set: { lastModified: Date.now() },
            }, (err) => {
              if (err) reject(err);
              else resolve();
            });
          } else {
            getBookFromRemote(req.body.id).then((data) => {
              logger.info('creating new obj');
              const dbBook = new Book(Book.createObjFromAPI(data));
              dbBook.owners.push(user._id);
              dbBook.save().then(() => resolve());
            }).catch(reject);
          }
        } else {
          reject(err);
        }
      });
    });
  }).then(() => {
    res.json({ success: true });
  }).catch(next); /* wtf eslint?? */ // eslint-disable-line
});

router.delete('/books/:id', auth.required, (req, res, next) => {
  req.assert('id', 'required').notEmpty();

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) throw new FormValidationError(result.array());
    return Book.update({ id: req.params.id }, { $pull: { owners: req.token.id } });
  }).then(() => {
    res.json({ success: true });
  }).catch(next);
});

module.exports = router;
