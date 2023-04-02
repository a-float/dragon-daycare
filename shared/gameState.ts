import z from "zod";
import { areCoordEqual, TileCoord } from "./tileCoord.js";
import { UserEvent } from "./userEvent.js";

export const TICK_INVERVAL = 70;

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

export const HatchRange = z.object({
  temp: z.tuple([z.number(), z.number()]),
  wetness: z.tuple([z.number(), z.number()]),
});

export type EggState = z.infer<typeof EggState>;
export const EggState = z.object({
  id: ObjectID,
  pos: TileCoord,
  hatchRange: HatchRange,
  wetness: z.number(),
  progress: z.number(),
  hp: z.number(),
  temp: z.number(),
  heldBy: z.number().int().optional(),
});

export type GameState = z.infer<typeof GameState>;
export const GameState = z.object({
  lifes: z.number().int(),
  hatched: z.number().int(),
  players: z.array(PlayerState),
  eggs: z.array(EggState),
});

export type Device = z.infer<typeof Device>;
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
  isSticky: z.boolean().optional(),
});

export type MapState = z.infer<typeof MapState>;
export const MapState = z.object({
  width: z.number().int(),
  height: z.number().int(),
  tiles: z.array(TileState),
  startPoints: z.array(TileCoord),
});

export function createGameState(): GameState {
  return {
    lifes: 3,
    hatched: 0,
    players: [],
    eggs: [
      {
        id: "Egg#1",
        pos: [1, 0],
        temp: 0.5,
        hp: 1,
        wetness: 0.5,
        progress: 0,
        hatchRange: {
          temp: [0.1, 0.3],
          wetness: [0.8, 1],
        },
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
    const targetTile = getNextPos(player.pos, player.dir);
    const heldEgg = gameState.eggs.find((egg) => egg.heldBy === event.player);
    if (!heldEgg) {
      const egg = gameState.eggs.find((egg) =>
        areCoordEqual(egg.pos, targetTile)
      );
      if (egg && !egg.heldBy) {
        egg.heldBy = event.player;
        egg.pos = [-1, -1];
      }
    } else {
      const isTargetTileTaken = !!gameState.eggs.find((egg) =>
        areCoordEqual(egg.pos, targetTile)
      );
      const otherPlayerIdx = gameState.players.findIndex((p) =>
        areCoordEqual(p.pos, targetTile)
      );
      const otherPlayer = gameState.players[otherPlayerIdx];
      if (otherPlayer && !otherPlayer.heldObject) {
        otherPlayer.heldObject = player.heldObject;
        player.heldObject = undefined;
        heldEgg.heldBy = otherPlayerIdx;
        return;
      }
      if (!isTargetTileTaken) {
        if (!heldEgg) throw new Error("I lost the egg... :(");
        else heldEgg.pos = targetTile;
        player.heldObject = undefined;
        heldEgg.heldBy = undefined;
      }
    }
  }
};

const isOnStickyFloor = (
  mapState: MapState,
  tilePos: TileCoord
): boolean | undefined => {
  return mapState.tiles[mapState.width * tilePos[1] + tilePos[0]]?.isSticky;
};

const movePlayers = (gameState: GameState, mapState: MapState): number[] => {
  const playersThatMoved: number[] = [];
  const nextCoords = gameState.players.map((player) => {
    if (!player.isMoving) return player.pos;
    const next = getNextPos(player.pos, player.dir);
    return canStandOnCoords(mapState, next) ? next : player.pos;
  });

  gameState.players.forEach((player, i) => {
    if (!player.isMoving || playersThatMoved.includes(i)) return;
    const playerNextPos = nextCoords[i];
    if (!areCoordEqual(playerNextPos, getNextPos(player.pos, player.dir))) {
      player.isMoving = false;
      return;
    }
    for (let j = 0; j < gameState.players.length; j++) {
      if (i === j) continue;
      const other = gameState.players[j];
      const otherNextPos = nextCoords[j];
      // collision with other not moving
      if (!other.isMoving && areCoordEqual(playerNextPos, otherNextPos)) {
        player.isMoving = false;
        return;
      }
      // head on collision
      if (
        other.isMoving &&
        areCoordEqual(player.pos, other.pos) &&
        (player.dir + other.dir) % 2 === 0 &&
        player.dir !== other.dir
      ) {
        player.dir = ((player.dir + 2) % 4) as unknown as TurnDirection;
        nextCoords[i] = getNextPos(player.pos, player.dir);
        player.pos = nextCoords[i];
        playersThatMoved.push(i);

        other.dir = ((other.dir + 2) % 4) as unknown as TurnDirection;
        nextCoords[j] = getNextPos(other.pos, other.dir);
        other.pos = nextCoords[j];
        playersThatMoved.push(j);
      }
      // perpendicular collision
      if (other.isMoving && (player.dir + other.dir) % 2 === 1) {
        if (areCoordEqual(playerNextPos, otherNextPos)) {
          // would collide - decide priority
          const toStop = Math.max(i, j);
          const toKeepMoving = Math.min(i, j);
          gameState.players[toStop].isMoving = false;
          // gameState.players[toKeepMoving].pos = nextCoords[toKeepMoving];
          playersThatMoved.push(toKeepMoving);
        }
      }
    }
    if (!playersThatMoved.includes(i) && player.isMoving) {
      player.pos = playerNextPos;
      playersThatMoved.push(i);
    }
  });
  for (const idx of playersThatMoved) {
    if (isOnStickyFloor(mapState, gameState.players[idx].pos)) {
      gameState.players[idx].isMoving = false;
    }
  }

  return playersThatMoved;
};

const resetEgg = (egg: EggState) => {
  egg.temp = 0.5;
  egg.wetness = 0.5;
  egg.hp = 1;
  egg.progress = 0;
  egg.pos = [0, 0];
  egg.hatchRange = {
    temp: Math.random() < 0.5 ? [0.1, 0.3] : [0.6, 0.9],
    wetness: Math.random() < 0.5 ? [0.0, 0.25] : [0.67, 0.9],
  };
};

const clamp = (min: number, val: number, max: number) =>
  Math.min(Math.max(val, min), max);

const normalize = (val: number) =>
  Math.abs(val) < 0.0001 ? 0 : val / Math.abs(val);

const updateEggState = (
  egg: EggState,
  gameState: GameState,
  mapState: MapState
) => {
  if (egg.hp <= 0 || egg.progress >= 1) {
    if (egg.hp <= 0) {
      console.log("Egg broken");
      gameState.lifes -= 1;
    } else if (egg.progress >= 1) {
      console.log("Egg hatched!");
      gameState.hatched += 1;
    }
    resetEgg(egg);
    let pos: TileCoord;
    do {
      pos = [
        Math.floor(Math.random() * mapState.width),
        Math.floor(Math.random() * mapState.height),
      ];
    } while (!canStandOnCoords(mapState, pos));
    egg.pos = pos;
    return;
  }

  egg.temp += normalize(0.5 - egg.temp) / TICK_INVERVAL / 10;
  egg.wetness += normalize(0.5 - egg.wetness) / TICK_INVERVAL / 10;
  if (Math.abs(egg.temp - 0.5) < 0.01) egg.temp = 0.5;
  if (Math.abs(egg.wetness - 0.5) < 0.01) egg.wetness = 0.5;

  const tileIdx = egg.pos[1] * mapState.width + egg.pos[0];
  const device = mapState.tiles[tileIdx]?.device;
  if (device === "freezer") egg.temp -= 0.8 / TICK_INVERVAL;
  else if (device === "furnace") egg.temp += 0.8 / TICK_INVERVAL;
  else if (device === "dryer") egg.wetness -= 0.8 / TICK_INVERVAL;
  else if (device === "moisturizer") egg.wetness += 0.8 / TICK_INVERVAL;
  egg.temp = clamp(0, egg.temp, 1);
  egg.wetness = clamp(0, egg.wetness, 1);
  egg.hp = clamp(0, egg.hp, 1);

  if (
    egg.hatchRange.temp[0] <= egg.temp &&
    egg.temp <= egg.hatchRange.temp[1] &&
    egg.hatchRange.wetness[0] <= egg.wetness &&
    egg.wetness <= egg.hatchRange.wetness[1]
  ) {
    egg.progress += 0.8 / TICK_INVERVAL;
    egg.hp += 0.1 / TICK_INVERVAL;
  } else {
    egg.hp -= 0.1 / TICK_INVERVAL;
  }
};

const pickUpLyingEgg = (
  player: PlayerState,
  idx: number,
  gameState: GameState
) => {
  const eggToPickUp = gameState.eggs.find(
    (egg) => areCoordEqual(player.pos, egg.pos) && egg.heldBy === undefined
  );
  if (player.heldObject === undefined && eggToPickUp) {
    eggToPickUp.heldBy = idx;
    eggToPickUp.pos = [-1, -1];
    player.heldObject = eggToPickUp.id;
  }
};

export const updateState = (
  gameState: GameState,
  mapState: MapState,
  events: UserEvent[]
) => {
  events.forEach((e) => applyUserEvent(gameState, mapState, e));
  gameState.players.forEach((player, i) =>
    pickUpLyingEgg(player, i, gameState)
  );
  movePlayers(gameState, mapState);
  gameState.eggs.forEach((egg) => updateEggState(egg, gameState, mapState));
  // TODO update everyone on who moved where
};
