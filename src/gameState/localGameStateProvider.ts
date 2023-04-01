import { UserEvent } from "./userEvent";
import AbstractGameStateProvider from "./abstractGameStateProvider";
import { createGameState, TICK_INVERVAL, updateState } from "./gameState";
import loadMap from "../utils/loadMap";
import mapText from "../maps/map_01.txt?raw";

class LocalGameStateProvider extends AbstractGameStateProvider {
  eventsQueue: UserEvent[] = [];

  constructor() {
    super();

    this.mapState = loadMap(mapText);
    this.gameState = createGameState(this.mapState);

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

    // Notifying subscribes
    this.gameState = this.gameState;
  }

  sendEvent(event: UserEvent): void {
    this.eventsQueue.push(event);
  }
}

export default LocalGameStateProvider;
