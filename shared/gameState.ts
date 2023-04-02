import z from "zod";
import { UserEvent } from "./userEvent.js";

export const TICK_INVERVAL = 50;

export type TileCoord = z.infer<typeof TileCoord>;
export const TileCoord = z.tuple([z.number().int(), z.number().int()]);

function areCoordEqual(a: TileCoord, b: TileCoord) {
  return a[0] === b[0] && a[1] === b[1];
}

export type TurnDirection = z.infer<typeof TurnDirection>;
export const TurnDirection = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const ObjectID = z.string();

export const MoveState = z.union([
  z.object({
    type: z.literal("idle"),
  }),
  z.object({
    type: z.literal("move"),
    startedAt: z.number(),
  }),
]);

export type PlayerState = z.infer<typeof PlayerState>;
export const PlayerState = z.object({
  pos: TileCoord,
  isMoving: z.boolean(),
  dir: TurnDirection,
  heldObject: ObjectID.optional(),
});

export type EggState = z.infer<typeof EggState>;
export const EggState = z.object({
  id: ObjectID,
  pos: TileCoord,
});

export type GameState = z.infer<typeof GameState>;
export const GameState = z.object({
  players: z.tuple([PlayerState, PlayerState]),
  eggs: z.array(EggState),
});

type Device = z.infer<typeof Device>;
export const Device = z.union([
  z.literal("furnace"),
  z.literal("freezer"),
  z.literal("moisturizer"),
  z.literal("dryer"),
]);

export type TileState = z.infer<typeof TileState>;
export const TileState = z.object({
  isWall: z.boolean(),
  device: Device.optional(),
});

export type MapState = z.infer<typeof MapState>;
export const MapState = z.object({
  width: z.number().int(),
  height: z.number().int(),
  tiles: z.array(TileState),
  startPoints: z.array(TileCoord),
});

export function createGameState(mapState: MapState): GameState {
  return {
    players: [
      {
        dir: 0,
        isMoving: false,
        pos: mapState.startPoints[0],
      },
      {
        dir: 0,
        isMoving: false,
        pos: mapState.startPoints[1],
      },
    ],
    eggs: [
      {
        id: "Egg#1",
        pos: [0, 0],
      },
    ],
  };
}

const getNextPos = (pos: TileCoord, dir: TurnDirection): TileCoord => {
  const diff = { x: 0, y: 0 };
  if (dir === 0) {
    diff.y = -1;
  } else if (dir === 1) {
    diff.x = 1;
  } else if (dir === 2) {
    diff.y = 1;
  } else {
    diff.x = -1;
  }

  return [pos[0] + diff.x, pos[1] + diff.y];
};

const canStandOnCoords = (mapState: MapState, tilePos: TileCoord): boolean => {
  if (
    tilePos[0] < 0 ||
    tilePos[0] >= mapState.width ||
    tilePos[1] < 0 ||
    tilePos[1] >= mapState.height
  ) {
    return false;
  }

  const tile = mapState.tiles[mapState.width * tilePos[1] + tilePos[0]];

  return !tile.isWall;
};

const applyUserEvent = (
  gameState: GameState,
  mapState: MapState,
  event: UserEvent
) => {
  console.log(`Event: ${JSON.stringify(event)}`);
  const player = gameState.players[event.player];

  if (player.isMoving) return;

  if (event.type === "move") {
    player.dir = event.dir;

    const newPos = getNextPos(player.pos, event.dir);

    if (canStandOnCoords(mapState, newPos)) {
      player.isMoving = true;
    }
  }

  if (event.type === "action") {
    console.log("Action performed");
  }
};

const movePlayers = (gameState: GameState, mapState: MapState): number[] => {
  const playersThatMoved: number[] = [];
  // each player's preferred next tile
  const nextCoords = gameState.players.map((player) => {
    if (!player.isMoving) return player.pos;
    const next = getNextPos(player.pos, player.dir);
    return canStandOnCoords(mapState, next) ? next : player.pos;
  });

  gameState.players.forEach((player, i) => {
    if (player.isMoving) {
      const next = nextCoords[i];

      for (let j = 0; j < gameState.players.length; j++) {
        if (i === j) continue;

        const otherNext = nextCoords[j];
        if (areCoordEqual(next, otherNext)) {
          // collision about to occur
          if (j < i || !gameState.players[j].isMoving) {
            // bounce back, other player has a higher priority to be on this tile
            player.dir = ((player.dir + 2) % 4) as unknown as TurnDirection;
            const newNext = getNextPos(player.pos, player.dir);
            //
            if (canStandOnCoords(mapState, newNext)) {
              nextCoords[i] = newNext;
              player.pos = newNext;
              playersThatMoved.push(i);
              // TODO earlier player might have actually took that place, might act up in some edge cases
            } else {
              player.isMoving = false;
            }
            break;
          }
        } else {
          // all good, take the spot
          if (!areCoordEqual(player.pos, next)) {
            player.pos = next;
            playersThatMoved.push(i);
          } else {
            player.isMoving = false;
          }
        }
      }
    }
  });

  return playersThatMoved;
};

export const updateState = (
  gameState: GameState,
  mapState: MapState,
  events: UserEvent[]
) => {
  events.forEach((e) => applyUserEvent(gameState, mapState, e));

  const playersThatMoved = movePlayers(gameState, mapState);

  playersThatMoved.forEach((playerId) => {
    console.log(
      `Player ${playerId} has moved in direction ${gameState.players[playerId].dir}`
    );
  });
};