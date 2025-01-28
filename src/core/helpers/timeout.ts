export default class Timeout {
  private static timeouts: Map<symbol, number> = new Map();

  private constructor() {

  }

  static call(delay: number, callback: () => void): { stop: () => void } {
    const start = performance.now();
    const id = Symbol("timeoutId");

    const tick = (now: number) => {
      if (now - start >= delay) {
        callback();
        this.timeouts.delete(id);
      } else {
        this.timeouts.set(id, requestAnimationFrame(tick));
      }
    };

    this.timeouts.set(id, requestAnimationFrame(tick));

    return {
      stop: () => this.clearTimeout(id),
    };
  }

  private static clearTimeout(id: symbol): void {
    if (this.timeouts.has(id)) {
      cancelAnimationFrame(this.timeouts.get(id)!);
      this.timeouts.delete(id);
    }
  }
}