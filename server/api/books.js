const router = require('express').Router();
const request = require('request');
const logger = require('../core/logger');
const Book = require('../models/Book');

router.get('/', (req, res, next) => {
  Book.find({ $where: 'this.owners.length >= 1' }, { __v: 0, _id: 0 })
    .sort({ lastModified: -1 })
    .then((books) => {
      res.json(books);
    }).catch(next);
});

router.get('/:id', (req, res, next) => {
  req.assert('id', 'required').notEmpty();

  Book.findOne({ id: req.params.id }, { __v: 0, _id: 0 })
    .sort({ lastModified: -1 })
    .populate('owners', { username: 1 })
    .then((books) => {
      res.json(books);
    })
    .catch(next);
});

function searchBooks(query) {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'production') {
      const searchURL = `https://www.googleapis.com/books/v1/volumes?key=${process.env.GOOGLE_API_KEY}&orderBy=relevance&q=${encodeURIComponent(query)}`;
      request.get({
        url: searchURL,
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
      resolve(require('./examples/books_example_response')); // eslint-disable-line
    }
  });
}

function checkForOwners(id) {
  return new Promise((resolve) => {
    Book.findOne({ id }, { owners: 1 }).then((book) => {
      if (!book || !book.owners) resolve([]);
      else resolve(book.owners);
    });
  });
}

router.get('/search/:query', (req, res, next) => {
  searchBooks(req.params.query).then((result) => {
    const response = [];
    const promises = [];
    if (result.items) {
      result.items.forEach((book) => {
        const obj = Book.createObjFromAPI(book);
        promises.push(checkForOwners(obj.id));
        response.push(obj);
      });
    }
    Promise.all(promises).then((owners) => {
      for (let i = 0; i < response.length; i++) {
        response[i].owners = owners[i];
      }
      res.json(response);
    });
  }).catch(next);
});

module.exports = router;
