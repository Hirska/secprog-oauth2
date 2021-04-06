import GeneralError from './GeneralError';

export default class InvalidScopeError extends GeneralError {
  constructor(message = 'InvalidScope') {
    super(message);
    this.name = 'invalid_scope';
    this.code = 400;
  }
}
