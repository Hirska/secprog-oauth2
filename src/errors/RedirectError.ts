export default class RedirectError extends Error {
  code: number;
  redirectUrl?: string;
  constructor(message = 'RedirectError') {
    super(message);
    this.name = 'RedirectError';
    this.code = 500;
  }
}
