module.exports = {
  'env': {
    'node': true
  },
  'extends': ['eslint:recommended', 'airbnb-base'],
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'no-plusplus': 0,
    'import/no-extraneous-dependencies': 0,
    'prefer-template': 0,
    'no-underscore-dangle': 0,
    'no-console': 0,
  }
};
