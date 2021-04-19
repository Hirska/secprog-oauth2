import RedirectError from './RedirectError';

export default class InvalidRequestError extends RedirectError {
  constructor(message = 'InvalidRequest', redirectUrl: string | undefined = undefined) {
    super(message);
    this.name = 'invalid_request';
    this.code = 400;
    this.redirectUrl = redirectUrl;
  }
}
