import { parseMap, maps, UserEvent } from "@dragon-daycare/shared";
import AbstractGameStateProvider from "./abstractGameStateProvider";
import {
  createGameState,
  TICK_INVERVAL,
  updateState,
} from "../../../shared/gameState";

class LocalGameStateProvider extends AbstractGameStateProvider {
  eventsQueue: UserEvent[] = [];

  constructor() {
    super();

    this.mapState = maps.MAP_0;
    this.gameState = createGameState(this.mapState);

    console.log(this.mapState);

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
