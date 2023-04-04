import * as THREE from "three";
import { MapState, TileCoord } from "@dragon-daycare/shared";

import { Disposable } from "./disposable.js";
import loadTexture from "../utils/loadTexture.js";
import TileMap, { Neighbour } from "../utils/tileMap.js";
import vertexShader from "./wall.vert?raw";
import fragmentShader from "./wall.frag?raw";

const ASSETS = Promise.all([loadTexture("/rock-tiles.png")]);

const TILE_SIZE_PX = 128;

function makeTileGeometry(u: number, v: number) {
  const geometry = new THREE.BufferGeometry();

  const indices = [0, 1, 2, 2, 3, 0];

  // create a simple square shape. We duplicate the top left and bottom right
  // vertices because each vertex needs to appear once per triangle.
  const vertices = new Float32Array([
    ...[0.0, 0.0, 0.0],
    ...[1.0, 0.0, 0.0],
    ...[1.0, 1.0, 0.0],
    ...[0.0, 1.0, 0.0],
  ]);

  const normals = new Float32Array([
    ...[0.0, 0.0, 1.0],
    ...[0.0, 0.0, 1.0],
    ...[0.0, 0.0, 1.0],
    ...[0.0, 0.0, 1.0],
  ]);

  const uvs = new Float32Array([
    ...[u, v + 1],
    ...[u + 1.0, v + 1],
    ...[u + 1.0, v],
    ...[u, v],
  ]);

  // itemSize = 3 because there are 3 values (components) per vertex
  geometry.setIndex(indices);
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

  return geometry;
}

const TileGeos = {
  topLeftCornerHollow: makeTileGeometry(11, 4),
  topRightCornerHollow: makeTileGeometry(13, 4),
  bottomLeftCornerHollow: makeTileGeometry(11, 6),
  bottomRightCornerHollow: makeTileGeometry(13, 6),

  bottomRightCornerFull: makeTileGeometry(6, 7),

  verticalPipe: makeTileGeometry(6, 7),
  horizontalPipe: makeTileGeometry(7, 8),

  topKnob: makeTileGeometry(6, 6),
  rightKnob: makeTileGeometry(8, 8),
  bottomKnob: makeTileGeometry(6, 9),
  leftKnob: makeTileGeometry(5, 8),

  center: makeTileGeometry(4, 3),
};

const TILE_MAP = new TileMap(
  [
    {
      neighbours: Neighbour.RIGHT | Neighbour.BOTTOM,
      geometry: TileGeos.topLeftCornerHollow,
    },
    {
      neighbours: Neighbour.LEFT | Neighbour.BOTTOM,
      geometry: TileGeos.topRightCornerHollow,
    },
    {
      neighbours: Neighbour.RIGHT | Neighbour.TOP,
      geometry: TileGeos.bottomLeftCornerHollow,
    },
    {
      neighbours: Neighbour.LEFT | Neighbour.TOP,
      geometry: TileGeos.bottomRightCornerHollow,
    },

    {
      neighbours: Neighbour.TOP | Neighbour.BOTTOM,
      geometry: TileGeos.verticalPipe,
    },
    {
      neighbours: Neighbour.LEFT | Neighbour.RIGHT,
      geometry: TileGeos.horizontalPipe,
    },

    {
      neighbours: Neighbour.BOTTOM,
      geometry: TileGeos.topKnob,
    },
    {
      neighbours: Neighbour.LEFT,
      geometry: TileGeos.rightKnob,
    },
    {
      neighbours: Neighbour.TOP,
      geometry: TileGeos.bottomKnob,
    },
    {
      neighbours: Neighbour.RIGHT,
      geometry: TileGeos.leftKnob,
    },
  ],
  TileGeos.center
);

class WallObject extends THREE.Group implements Disposable {
  constructor(
    [tileset]: Awaited<typeof ASSETS>,
    mapState: MapState,
    pos: TileCoord
  ) {
    super();

    this.position.set(...pos, 0);

    console.log(
      `Tileset dimensions: ${JSON.stringify([
        tileset.image.width,
        tileset.image.height,
      ])}`
    );

    let uniforms = {
      uGrid: {
        type: "vec4",
        value: [
          TILE_SIZE_PX / tileset.image.width,
          TILE_SIZE_PX / tileset.image.height,
          56 / tileset.image.width,
          43 / tileset.image.height,
        ],
      },
      uMap: { type: "t", value: tileset },
    };

    let material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      depthWrite: false,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const mesh = new THREE.Mesh(
      TILE_MAP.matchGeometry(mapState, pos),
      material
    );
    mesh.position.add(new THREE.Vector3(-0.5, 0.5, 0));
    mesh.rotateX(Math.PI);
    this.add(mesh);
  }

  dispose(): void {}
}

export async function makeWallObject(mapState: MapState, pos: TileCoord) {
  return new WallObject(await ASSETS, mapState, pos);
}

export default WallObject;
