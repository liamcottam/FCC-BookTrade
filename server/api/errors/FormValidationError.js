module.exports = function FormValidationError(data) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = 'This form contains errors';
  this.data = data;
};
