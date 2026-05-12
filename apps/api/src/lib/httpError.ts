/**
 * HTTP error with a stable status code for API responses.
 */
export class HttpError extends Error {
  readonly status: number;

  readonly code: string | undefined;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}
