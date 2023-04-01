import { UserEvent } from "./userEvent";
import generateLevel from "./generateLevel";
import AbstractGameStateProvider from "./abstractGameStateProvider";
import { createGameState, TICK_INVERVAL, updateState } from "./gameState";

class LocalGameStateProvider extends AbstractGameStateProvider {
  eventsQueue: UserEvent[] = [];

  constructor() {
    super();

    this.gameState = createGameState();
    this.mapState = generateLevel();

    setInterval(() => {
      this.update();
    }, TICK_INVERVAL);
  }

  update() {
    if (!this.gameState || !this.mapState) {
      return;
    }

    updateState(this.gameState, this.mapState, this.eventsQueue);
    this.eventsQueue = [];
  }

  sendEvent(event: UserEvent): void {
    this.eventsQueue.push(event);
  }
}

export default LocalGameStateProvider;
