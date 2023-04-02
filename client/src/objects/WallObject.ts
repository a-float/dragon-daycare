import * as THREE from "three";
import { Disposable } from "./disposable.js";
import loadTexture from "../utils/loadTexture.js";
import vertexShader from "./wall.vert?raw";
import fragmentShader from "./wall.frag?raw";

const ASSETS = Promise.all([
  loadTexture("/rock-tiles.png"),
  loadTexture("/single-rock.png"),
]);

const TILE_SIZE_PX = 128;

function makeTileGeometry(u: number, v: number) {
  const geometry = new THREE.BufferGeometry();
  // create a simple square shape. We duplicate the top left and bottom right
  // vertices because each vertex needs to appear once per triangle.
  const vertices = new Float32Array([
    0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0,

    1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0,
  ]);

  const uvs = new Float32Array([
    u,
    v,
    u + 1.0,
    v,
    u + 1.0,
    v + 1.0,

    u + 1.0,
    v + 1.0,
    u,
    v + 1.0,
    u,
    v,
  ]);

  // itemSize = 3 because there are 3 values (components) per vertex
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  const uvsAttribute = new THREE.BufferAttribute(uvs, 2);
  geometry.setAttribute("uv", uvsAttribute);
  uvsAttribute.needsUpdate = true;

  return geometry;
}

const TileGeos = {
  center: makeTileGeometry(0, 0),
};

class WallObject extends THREE.Group implements Disposable {
  constructor(
    [tileset, singleRock]: Awaited<typeof ASSETS>,
    x: number,
    y: number
  ) {
    super();

    this.position.set(x, y, 0);

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
      // depthWrite: false,
      side: THREE.DoubleSide,
      // transparent: true,
    });

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      // material
      new THREE.MeshBasicMaterial({ map: singleRock, transparent: true })
    );
    mesh.scale.setScalar(1.3);
    mesh.rotateX(Math.PI);
    this.add(mesh);
  }

  dispose(): void {}
}

export async function makeWallObject(x: number, y: number) {
  return new WallObject(await ASSETS, x, y);
}

export default WallObject;
