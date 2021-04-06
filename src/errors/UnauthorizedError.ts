import GeneralError from './GeneralError';

export default class UnauthorizedError extends GeneralError {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    this.code = 400;
  }
}
