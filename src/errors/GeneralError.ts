export default class GeneralError extends Error {
  code: number;
  constructor(message = 'GeneralError') {
    super(message);
    this.name = 'GeneralError';
    this.code = 500;
  }
}
