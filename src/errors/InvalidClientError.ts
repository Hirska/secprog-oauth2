import GeneralError from './GeneralError';

export default class InvalidClientError extends GeneralError {
  constructor(message = 'InvalidClient') {
    super(message);
    this.name = 'invalid_client';
    this.code = 400;
  }
}
