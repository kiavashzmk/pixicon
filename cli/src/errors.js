export class PixiconError extends Error {
  constructor(code, message, path, details) {
    super(message);
    this.code = code;
    this.path = path;
    this.details = details;
  }

  toJSON() {
    const obj = { error: this.code, message: this.message };
    if (this.path) obj.path = this.path;
    if (this.details) obj.details = this.details;
    return obj;
  }
}
