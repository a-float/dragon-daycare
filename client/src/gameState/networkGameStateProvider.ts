import { UserEvent, GameState, MapState } from "@dragon-daycare/shared";
import AbstractGameStateProvider from "./abstractGameStateProvider.js";

class NetworkGameStateProvider extends AbstractGameStateProvider {
  private ws: WebSocket;

  constructor() {
    super();

    this.ws = new WebSocket(`ws://jkostecki.ddns.net:1111`);

    const code = window.location.href.split("?code=")[1];

    this.ws.addEventListener("open", (_) => {
      this.ws.send(JSON.stringify({ type: 0, code: code }));
    });

    this.ws.addEventListener("message", (data) => {
      data = JSON.parse(data.data);

      if ((data as any).type == 5) {
        (document.querySelector("#waiting") as HTMLElement).style.display =
          "none";
      }

      if ((data as any).type == 6) {
        console.log("data from server", data);

        this.gameState = GameState.parse((data as any).state);
        this.mapState = MapState.parse((data as any).map);
      }
    });
  }

  sendEvent(_event: UserEvent): void {
    // Not supported on the view-only client
  }
}

export default NetworkGameStateProvider;
