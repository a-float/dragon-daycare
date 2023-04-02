class KeyboardState {
  private pressedKeys: Set<string> = new Set<string>();
  private static _instance: KeyboardState | undefined = undefined;

  constructor() {
    if (KeyboardState._instance) return KeyboardState._instance;
    KeyboardState._instance = this;

    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  release() {
    // TODO probably wont remove listeners because of binds
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }

  private handleKeyDown(e: KeyboardEvent) {
    this.pressedKeys.add(e.key);
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.pressedKeys.delete(e.key);
  }

  pressed(key: string): boolean {
    return this.pressedKeys.has(key);
  }
}

export default new KeyboardState();
