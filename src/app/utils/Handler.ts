export interface Handler {
  setNext(handler: Handler): Handler;
  exec(target: unknown): unknown;
}
