import z from "zod";

export type TileCoord = z.infer<typeof TileCoord>;
export const TileCoord = z.tuple([z.number().int(), z.number().int()]);

export function areCoordEqual(a: TileCoord, b: TileCoord) {
  return a[0] === b[0] && a[1] === b[1];
}

export function lerpCoords(a: TileCoord, b: TileCoord, t: number): TileCoord {
  return [b[0] * t + a[0] * (1 - t), b[1] * t + a[1] * (1 - t)];
}
