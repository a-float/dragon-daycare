import { GameState, MapState } from "./gameState";
import { UserEvent } from "./userEvent";

type Listener<T> = (value: T) => void;

abstract class AbstractGameStateProvider {
  private _gameState: GameState | null = null;
  private _mapState: MapState | null = null;

  private subs: Set<Listener<GameState>> = new Set();
  private subsMap: Set<Listener<MapState>> = new Set();

  constructor() {}

  subscribe(listener: Listener<GameState>): () => void {
    this.subs.add(listener);

    if (this._gameState) {
      listener(this._gameState);
    }

    return () => this.subs.delete(listener);
  }

  subscribeMap(listener: Listener<MapState>): () => void {
    this.subsMap.add(listener);

    if (this._mapState) {
      listener(this._mapState);
    }

    return () => this.subsMap.delete(listener);
  }

  set gameState(newState: GameState) {
    this._gameState = newState;

    for (const sub of this.subs.values()) {
      sub(newState);
    }
  }

  set mapState(newState: MapState) {
    this._mapState = newState;

    for (const sub of this.subsMap.values()) {
      sub(newState);
    }
  }

  abstract sendEvent(event: UserEvent): void;
}

export default AbstractGameStateProvider;
