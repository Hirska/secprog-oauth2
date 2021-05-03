import RedirectError from './RedirectError';

export default class InvalidScopeError extends RedirectError {
  constructor(message = 'InvalidScope') {
    super(message);
    this.name = 'invalid_scope';
    this.code = 400;
  }
}
