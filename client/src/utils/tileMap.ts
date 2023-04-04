import { MapState, TileCoord, TileState } from "@dragon-daycare/shared";

export enum Neighbour {
  TOP_LEFT = 1,
  TOP = 2,
  TOP_RIGHT = 4,
  LEFT = 8,
  CENTER = 16,
  RIGHT = 32,
  BOTTOM_LEFT = 64,
  BOTTOM = 128,
  BOTTOM_RIGHT = 256,
}

const neighbourPositions = [
  Neighbour.TOP_LEFT,
  Neighbour.TOP,
  Neighbour.TOP_RIGHT,
  Neighbour.LEFT,
  Neighbour.CENTER,
  Neighbour.RIGHT,
  Neighbour.BOTTOM_LEFT,
  Neighbour.BOTTOM,
  Neighbour.BOTTOM_RIGHT,
];

type Rule = { neighbours: number; geometry: THREE.BufferGeometry };

function matchRule(rule: Rule, states: (TileState | null)[]) {
  for (let i = 0; i < 9; ++i) {
    if (i === 4) {
      // Self, the center tile
      continue;
    }

    const state = states[i];
    if (
      !!(rule.neighbours & neighbourPositions[i]) &&
      !(state && state.isWall && !state.device)
    ) {
      console.log(
        `No match because i=${i}, state=${JSON.stringify(state)}, rule=${
          rule.neighbours & neighbourPositions[i]
        }`
      );
      return false;
    }
  }

  return true;
}

function getStateAtPos(mapState: MapState, [x, y]: TileCoord) {
  if (x < 0 || x >= mapState.width || y < 0 || y >= mapState.height) {
    return null;
  }

  const idx = x + y * mapState.width;
  return mapState.tiles[idx];
}

class TileMap {
  constructor(
    private readonly rules: Rule[],
    private readonly defaultCase: THREE.BufferGeometry
  ) {}

  matchGeometry(mapState: MapState, pos: TileCoord) {
    const states = [
      getStateAtPos(mapState, [pos[0] - 1, pos[1] - 1]), // TOP_LEFT
      getStateAtPos(mapState, [pos[0], pos[1] - 1]), // TOP
      getStateAtPos(mapState, [pos[0] + 1, pos[1] - 1]), // TOP_RIGHT
      getStateAtPos(mapState, [pos[0] - 1, pos[1]]),
      getStateAtPos(mapState, [pos[0], pos[1]]),
      getStateAtPos(mapState, [pos[0] + 1, pos[1]]),
      getStateAtPos(mapState, [pos[0] - 1, pos[1] + 1]),
      getStateAtPos(mapState, [pos[0], pos[1] + 1]),
      getStateAtPos(mapState, [pos[0] + 1, pos[1] + 1]),
    ];

    for (const rule of this.rules) {
      if (matchRule(rule, states)) {
        return rule.geometry;
      }
    }

    return this.defaultCase;
  }
}

export default TileMap;
