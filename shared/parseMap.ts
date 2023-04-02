import { MapState, TileCoord } from "./gameState.js";

const parseMap = (text: string): MapState => {
  text = text.replaceAll(" ", "");
  const startReg = /[\s]*([\S\n]+)\n/.exec(text);
  text = startReg?.[1] as string;
  console.log(text);

  const lines = text.split(/\r?\n/);
  const playerStarts: { [key: number]: TileCoord } = {};
  const [width, height] = [lines[0].length, lines.length];
  const tiles = text
    .replace(/\s/g, "")
    .split("")
    .map((c, idx) => {
      if (c === ".") return { isWall: false };
      else if (c === "#") return { isWall: true };
      else if (c.match(/^\d$/)) {
        playerStarts[parseInt(c)] = [idx % width, Math.floor(idx / width)];
        return { isWall: false };
      } else if (c === "F") return { isWall: true, device: "furnace" } as const;
      else if (c === "f") return { isWall: true, device: "freezer" } as const;
      else if (c === "D")
        return { isWall: true, device: "moisturizer" } as const;
      else if (c === "d") return { isWall: true, device: "dryer" } as const;
      else {
        throw new Error(`Unexpected character while loading the map: "${c}"`);
      }
    });

  const startPoints = Object.values(playerStarts);

  if (
    Math.max(...Object.keys(playerStarts).map((n) => parseInt(n))) + 1 >
    startPoints.length
  ) {
    throw new Error(`Missing player starting positions while loading the map.`);
  }

  return { width, height, tiles, startPoints };
};

export default parseMap;
