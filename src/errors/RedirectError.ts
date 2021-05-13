export default class RedirectError extends Error {
  code: number;
  constructor(message = 'RedirectError') {
    super(message);
    this.name = 'RedirectError';
    this.code = 500;
  }
}
