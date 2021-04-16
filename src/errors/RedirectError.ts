export default class RedirectError extends Error {
  code: number;
  redirectUrl?: string;
  constructor(message = 'RedirectError', redirectUrl: string | undefined = undefined) {
    super(message);
    this.name = 'RedirectError';
    this.code = 500;
    this.redirectUrl = redirectUrl;
  }
}
