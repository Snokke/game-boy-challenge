export class Timeout {
  private static instance: Timeout;
  private timeouts: Map<number, number> = new Map();
  private idCounter = 0;

  private constructor() { }

  static getInstance(): Timeout {
    if (!Timeout.instance) {
      Timeout.instance = new Timeout();
    }
    return Timeout.instance;
  }

  static call(delay: number, callback: () => void): TimeoutInstance {
    return Timeout.getInstance().start(delay, callback);
  }

  private start(delay: number, callback: () => void): TimeoutInstance {
    const id = this.idCounter++;
    const startTime = performance.now();

    const loop = () => {
      if (!this.timeouts.has(id)) return;
      requestAnimationFrame(() => {
        if (performance.now() - startTime >= delay) {
          callback();
          this.timeouts.delete(id);
        } else {
          loop();
        }
      });
    };

    this.timeouts.set(id, requestAnimationFrame(loop));

    return new TimeoutInstance(this, id);
  }

  public stop(id: number) {
    if (this.timeouts.has(id)) {
      cancelAnimationFrame(this.timeouts.get(id)!);
      this.timeouts.delete(id);
    }
  }
}

export class TimeoutInstance {
  private manager: Timeout;
  private id: number;

  constructor(manager: Timeout, id: number) {
    this.manager = manager;
    this.id = id;
  }

  stop() {
    this.manager.stop(this.id);
  }
}