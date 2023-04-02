export type EasingFunc = (t: number) => number;

const lerp = (a: number, b: number, t: number) => b * t + a * (1 - t);

export const Easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => 1 - (1 - t) * (1 - t),
  easeInOut: (t: number) => t * t * (3.0 - 2.0 * t),
};

class SmoothValue {
  private _prev: number;
  private _next: number;
  private _inter: number = 0;
  private _step: number = 0.1;

  constructor(_value: number, private easing: EasingFunc = Easing.easeInOut) {
    this._prev = _value;
    this._next = _value;
  }

  get value() {
    return lerp(this._prev, this._next, this.easing(this._inter));
  }

  to(target: number, duration: number) {
    if (this._next === target) {
      return;
    }

    const current = this.value;

    this._prev = current;
    this._next = target;
    this._inter = 0;
    this._step = 1 / duration;
  }

  advance(delta: number) {
    this._inter += this._step * delta;
    if (this._inter > 1) {
      this._inter = 1;
    }
  }
}

export default SmoothValue;
