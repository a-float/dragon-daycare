import WebSocket, { WebSocketServer } from "ws";
import {
  GameState,
  MapState,
  updateState,
  UserEvent,
  maps,
  createGameState,
} from "@dragon-daycare/shared";
const wss = new WebSocketServer({
  port: 1111,
});

console.log(`Server started...`, wss);

type Player = WebSocket & {
  info?: { game: Game; playerId: number };
};

type Game = {
  code: string;
  players: Player[];
  screens: WebSocket[];
  state: GameState;
  mapState: MapState;
  events: UserEvent[];
  started: 0 | 1;
};

let clients: any = [];
var games: Game[] = [];

function cl(x: any) {
  console.log(x);
}

wss.on("connection", (ws: any) => {
  ws.on("message", (data: any) => {
    data = JSON.parse(data.toString("utf-8"));

    if (data.type == 0) {
      if (clients.indexOf(ws) == -1) {
        clients.push(ws);
        ws.info = {};
        
      }

      var found = false;
      for (var i = 0; i < games.length; i++) {
        if (games[i].code == data.code) {
          if (games[i].screens.indexOf(ws) == -1) {
            games[i].screens.push(ws);
            ws.info.game = games[i];
            ws.info.type = "screen";
            if (ws.info.game.started == 1) {
              ws.send(JSON.stringify({ type: 5 }));
            }
            ws.info.game.state.players.push( {
                    dir: 0, 
                            isMoving: false,
                                    pos: ws.info.game.map.startPoints[0],
                                          });
          }
          found = true;
          break;
        }
      }
      if (!found) {
        const mapState = maps.MAP_0;

        const newGame: Game = {
          code: data.code,
          players: [],
          screens: [ws],
          state: createGameState(mapState),
          mapState: mapState,
          events: [],
          started: 0,
        };

        games.push(newGame);
        ws.info.game = newGame;
        ws.info.type = "screen";
      }
    }

    if (data.type == 1) {
      if (clients.indexOf(ws) == -1) {
        clients.push(ws);
        ws.info = {};
      }
      for (var i = 0; i < games.length; i++) {
        if (games[i].code == data.code) {
          if (games[i].players.indexOf(ws) == -1) {
            games[i].players.push(ws);
            ws.info.type = "player";
            ws.info.game = games[i];
            ws.info.player_id = data.player_id;
            if (ws.info.game.started == 1) {
              ws.send(JSON.stringify({ type: 5 }));
            }
          }
          break;
        }
      }
    }

    if (data.type == 2) {
      if (ws.info.player_id != -1) {
        ws.info.game.events.push(data.event);
        cl(ws.info.game.events);
      }
    }

    if (data.type == 4) {
      ws.info.game.started = 1;
      ws.info.game.players.forEach((val: any, ind: number) => {
        val.info.player_id = ind;
        val.send(JSON.stringify({ type: 3, player_id: ind }));
        val.send(JSON.stringify({ type: 5 }));
      });
      ws.info.game.screens.forEach((val: any) => {
        val.send(JSON.stringify({ type: 5 }));
      });
    }
  });

  ws.on("close", (_: any) => {
    var index = clients.indexOf(ws);

    if (ws.info.type == "player") {
      if (ws.info.length == undefined) {
        var ind = ws.info.game.players.indexOf(ws);
        if (ind != -1) {
          ws.info.game.players.splice(ind, 1);
        }
      }
    }

    if (ws.info.type == "screen") {
      var ind = ws.info.game.screens.indexOf(ws);
      if (ind != -1) {
        ws.info.game.screens.splice(ind, 1);
      }

      if (ws.info.game.screens.length == 0) {
        var toDel: any = ws.info.game;
        setTimeout((_) => {
          if (toDel != null && toDel.screens.length == 0) {
            var ind = games.indexOf(toDel);
            if (ind != -1) {
              games.splice(ind, 1);
            }
          }
        }, 60000);
      }
    }

    if (index != -1) {
      clients.splice(index, 1);
    }
  });
});

setInterval((_) => {
  games.forEach((game: any) => {
    if (game.started == 1) {
      modifyState(game);
      game.screens.forEach((screen: any) => {
        screen.send(
          JSON.stringify({ type: 6, state: game.state, map: game.mapState })
        );
      });
    }
  });
}, 70);

function modifyState(game: Game) {
  updateState(game.state, game.mapState, game.events);
  game.events = [];
}
