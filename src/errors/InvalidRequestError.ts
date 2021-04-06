import GeneralError from './GeneralError';

export default class InvalidRequestError extends GeneralError {
  constructor(message = 'InvalidRequest') {
    super(message);
    this.name = 'invalid_request';
    this.code = 400;
  }
}
