import RedirectError from './RedirectError';

export default class InvalidRequestError extends RedirectError {
  constructor(message = 'InvalidRequest') {
    super(message);
    this.name = 'invalid_request';
    this.code = 400;
  }
}
