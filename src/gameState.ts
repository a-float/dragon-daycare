import z from "zod";

type TileCoord = z.infer<typeof TileCoord>;
const TileCoord = z.tuple([z.number().int(), z.number().int()]);
type TurnDirection = z.infer<typeof TurnDirection>;
const TurnDirection = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);
const ObjectID = z.string();

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

export const TileState = z.object({ isWall: z.boolean() });

type MapState = z.infer<typeof MapState>;
export const MapState = z.object({
  width: z.number().int(),
  height: z.number().int(),
  tiles: z.array(TileState),
});

export function createGameState(): GameState {
  return {
    players: [
      {
        dir: 0,
        isMoving: false,
        pos: [0, 2],
      },
      {
        dir: 0,
        isMoving: false,
        pos: [1, 0],
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

type UserEvent = z.infer<typeof UserEvent>;
const UserEvent = z.union([
  z.object({
    type: z.literal("move"),
    player: z.number().int(),
    dir: TurnDirection,
  }),
  z.object({
    type: z.literal("action"),
    player: z.number().int(),
  }),
]);

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
  return [pos[0] + diff.y, pos[1] + diff.x];
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
    const diff = getDiffFromDir(event.dir);
    const newPos = [player.pos[0] + diff.y, (player.pos[1] = diff.y)];
    if (
      newPos[0] < 0 ||
      newPos[0] >= mapState.width ||
      newPos[1] < 0 ||
      newPos[1] >= mapState.height
    ) {
      return;
    }
    const nextTile = mapState.tiles[mapState.width * newPos[1] + newPos[1]];
    if (!nextTile.isWall) player.isMoving = true;
  }
  if (event.type === "action") {
    console.log("Action performed");
  }
};

const updatedState = (
  gameState: GameState,
  mapState: MapState,
  events: UserEvent[]
) => {
  events.forEach((e) => applyUserEvent(gameState, mapState, e));
  for (const player of gameState.players) {
    if (player.isMoving) {
      const diff = getDiffFromDir(player.dir);
    }
  }
};
