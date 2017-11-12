const mongoose = require('mongoose');
const striptags = require('striptags');

const { Schema } = mongoose;

const BookSchema = new Schema({
  id: {
    type: String,
    required: false,
    index: { 
      unique: true,
    },
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  shortDescription: {
    type: String,
    required: false,
  },
  thumbnail: {
    type: String,
    required: false,
  },
  lastModified: {
    type: Date,
    required: true,
  },
  owners: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  ],
});

BookSchema.statics.createObjFromAPI = function createObjFromAPI(book) {
  const obj = {
    id: book.id,
    title: book.volumeInfo.title,
    author: (book.volumeInfo.authors) ? book.volumeInfo.authors.join(', ') : null,
    description: (book.volumeInfo.description) ? striptags(book.volumeInfo.description.replace(/<br>/g, '\n'), [], '') : null,
    thumbnail: (book.volumeInfo.imageLinks) ? book.volumeInfo.imageLinks.thumbnail : null,
    shortDescription: null,
    lastModified: new Date(),
  };

  const maxLength = 280;
  if (obj.description && (obj.description.length >= maxLength || obj.description.includes('\n'))) {
    if (obj.description.indexOf('\n') !== -1 && obj.description.indexOf('\n') <= maxLength) {
      obj.shortDescription = obj.description.substr(0, obj.description.indexOf('\n'));
    } else {
      obj.shortDescription = obj.description.substr(0, obj.description.lastIndexOf(' ', maxLength));
    }
    if (obj.shortDescription.endsWith('.')) {
      obj.shortDescription += '..';
    } else {
      obj.shortDescription += '...';
    }
  }
  return obj;
}

module.exports = mongoose.model('Book', BookSchema);
