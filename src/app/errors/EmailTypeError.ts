export class EmailTypeError extends Error {
  constructor(type: string) {
    super(`${type} not exists in EmailType enum!`);
  }
}
