import GeneralError from './GeneralError';

export default class InvalidUserError extends GeneralError {
  constructor(message = 'InvalidClient') {
    super(message);
    this.name = 'invalid_user';
    this.code = 400;
  }
}
