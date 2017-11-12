const router = require('express').Router();
const logger = require('../core/logger');
const auth = require('../core/auth');
const Book = require('../models/Book');
const User = require('../models/User');
const Trade = require('../models/Trade');
const FormValidationError = require('./errors/FormValidationError');

router.use(auth.required);

router.get('/', (req, res, next) => {
  const userId = req.token.id;
  Trade.find({ $or: [{ sender: userId }, { recipient: userId }] }, { __v: 0 })
    .populate('recipient', { username: 1 })
    .populate('sender', { username: 1 })
    .populate('senderBook', { title: 1 })
    .populate('recipientBook', { title: 1 })
    .sort({ createdAt: -1 })
    .then((trades) => {
      res.json(trades);
    })
    .catch(next);
});

router.post('/', (req, res, next) => {
  req.assert('send', 'required').notEmpty();
  req.assert('receive', 'required').notEmpty();
  req.assert('user', 'required').notEmpty();

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) throw new FormValidationError(result.array());
    if (req.body.send === req.body.receive) throw new FormValidationError();
    if (req.body.user === req.token.id) throw new FormValidationError();

    // Ensure the books, recipient all exist first.
    const bookSend = Book.find({ id: req.body.send });
    const bookReceive = Book.find({ id: req.body.receive });
    const recipient = User.find({ _id: req.body.user });
    const sender = User.find({ _id: req.token.id });
    return Promise.all([bookSend, bookReceive, recipient, sender]);
  }).then((data) => {
    const bookSend = data[0][0];
    const bookReceive = data[1][0];
    const recipient = data[2][0];
    const sender = data[3][0];
    if (!bookSend || !bookReceive || !recipient || !sender) throw new Error('Object undefined');
    if (bookSend.owners.indexOf(sender._id) !== -1) throw new Error('Sender already owns book');
    if (bookReceive.owners.indexOf(recipient._id) !== -1) throw new Error('Recipient already owns book');

    // Next check there isn't already a trade proposed.
    Trade.findOne({
      sender,
      recipient,
      senderBook: bookSend,
      recipientBook: bookReceive,
      status: 'offered',
    }).then((trade) => {
      if (!trade) {
        const dbTrade = new Trade({
          sender,
          recipient,
          senderBook: bookSend,
          recipientBook: bookReceive,
          createdAt: Date.now(),
          status: 'offered',
        });
        dbTrade.save().then(() => {
          res.json({ success: true, id: dbTrade._id, status: 'created' });
        }).catch(next);
      } else {
        res.json({ success: true, id: trade._id, status: 'already created' });
      }
    }).catch(next);
  }).catch(next);
});

router.get('/read', auth.required, (req, res, next) => {
  logger.info(req.token.id);
  Trade.update({ recipient: req.token.id, read: false }, { $set: { read: true } }, { multi: true }).then(() => {
    res.json({ success: true });
  }).catch(next);
});

router.patch('/:id', auth.required, (req, res, next) => {
  req.assert('id', 'required').notEmpty();
  req.assert('status', 'required').notEmpty();

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) throw new FormValidationError(result.array());
    return Trade.findById(req.params.id);
  }).then((trade) => {
    if (!trade) throw new Error();
    if (trade.status !== 'offered') throw new Error();
    const newStatus = req.body.status;
    logger.info('status', req.body.status);
    const accepted = ['cancelled', 'rejected', 'accepted'];
    if (accepted.indexOf(newStatus) === -1) throw new Error('New status isn\'t acceptable');
    if (newStatus === 'cancelled' && String(trade.sender) !== req.token.id) throw new Error('User did not create the trade');
    if (newStatus === 'accepted') {
      // Well now...
      Promise.all([
        Book.findById(trade.senderBook),
        Book.findById(trade.recipientBook),
        User.findById(trade.recipient),
        User.findById(trade.sender),
      ]).then((values) => {
        if (values.some(v => v === null)) throw new Error('One of the items are fucked');
        const bookSend = values[0];
        const bookReceive = values[1];
        const recipient = values[2];
        const sender = values[3];
        if (bookSend.owners.indexOf(sender._id) !== -1) throw new Error('Sender already owns book');
        if (bookReceive.owners.indexOf(recipient._id) !== -1) throw new Error('Recipient already owns book');

        Promise.all([
          bookSend.update({ $pull: { owners: recipient._id } }),
          bookSend.update({ $addToSet: { owners: sender._id } }),
          bookReceive.update({ $pull: { owners: sender._id } }),
          bookReceive.update({ $addToSet: { owners: recipient._id } }),
        ]).then((i) => {
          logger.info(i);
          trade.status = newStatus; // eslint-disable-line
          return trade.save();
        }).catch(next);
      }).catch(next);
    } else {
      trade.status = newStatus; // eslint-disable-line
      return trade.save();
    }
  }).then(() => {
    res.json({ success: true });
  }).catch(next); // eslint-disable-line
});

module.exports = router;
