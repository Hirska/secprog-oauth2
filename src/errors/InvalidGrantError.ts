import GeneralError from './GeneralError';

export default class InvalidGrantError extends GeneralError {
  constructor(message = 'InvalidClient') {
    super(message);
    this.name = 'invalid_grant';
    this.code = 400;
  }
}
