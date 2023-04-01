import { MapState, TileCoord, TileState } from "./gameState";

function insert(mapState: MapState, x: number, y: number, tile: TileState) {
  let i = x + y * mapState.width;

  mapState.tiles[i] = TileState.parse(tile); // deep copy
}

function fillWith(
  mapState: MapState,
  min: [number, number],
  max: [number, number],
  tileMaker: (x: number, y: number) => TileState
) {
  for (let x = min[0]; x <= max[0]; ++x) {
    for (let y = min[1]; y <= max[1]; ++y) {
      insert(mapState, x, y, tileMaker(x, y));
    }
  }
}

function generateLevel(): MapState {
  // TODO: Add more levels and arguments to control what map we generate

  const mapState: MapState = {
    width: 15,
    height: 15,
    startPoints: [],
    tiles: [],
  };

  // Filling with walls
  mapState.tiles = new Array(mapState.width * mapState.height)
    .fill(null)
    .map((_) => ({
      isWall: true,
    }));

  // Inner field
  fillWith(mapState, [2, 2], [mapState.width - 3, mapState.height - 3], () => ({
    isWall: false,
  }));

  // Entry points
  const entryLeft = [1, Math.floor(mapState.height / 2)] as TileCoord;
  const entryRight = [
    mapState.width - 2,
    Math.floor(mapState.height / 2),
  ] as TileCoord;
  insert(mapState, ...entryLeft, { isWall: false });
  insert(mapState, ...entryRight, { isWall: false });

  mapState.startPoints.push(entryLeft);
  mapState.startPoints.push(entryRight);

  // Obstacles
  const obstacleTop = [Math.floor(mapState.width / 2), 2] as const;
  const obstacleBottom = [
    Math.floor(mapState.width / 2),
    mapState.height - 3,
  ] as const;
  insert(mapState, ...obstacleTop, { isWall: true });
  insert(mapState, ...obstacleBottom, { isWall: true });

  return mapState;
}

export default generateLevel;
