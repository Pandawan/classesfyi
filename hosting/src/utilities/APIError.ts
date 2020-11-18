/**
 * Marks an error in one of the APIs
 */
export class APIError extends Error {
  public code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }

  toString() {
    return `APIError ${this.code} ${this.message}`;
  }
}
