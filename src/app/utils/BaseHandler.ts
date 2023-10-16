import { Handler } from './Handler';

export abstract class BaseHandler implements Handler {
  private next: Handler | null = null;

  setNext(handler: Handler): Handler {
    this.next = handler;
    return this.next;
  }

  exec(target: unknown): unknown {
    if (this.next) {
      return this.next.exec(target);
    }
    return target;
  }
}
