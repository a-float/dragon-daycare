import * as THREE from "three";
import { Disposable } from "./disposable.js";
import loadTexture from "../utils/loadTexture.js";
import vertexShader from "./wall.vert?raw";
import fragmentShader from "./wall.frag?raw";

const ASSETS = Promise.all([loadTexture("/rock-tiles.png")]);

class WallObject extends THREE.Group implements Disposable {
  geo: THREE.BoxGeometry;

  constructor(assets: Awaited<typeof ASSETS>, x: number, y: number) {
    super();

    this.position.set(x, y, 0);

    let uniforms = {
      hueShift: { type: "float", value: colors[index] },
      uMap: { type: "t", value: bodyTexture },
    };

    let material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      transparent: true,
    });

    // this.geo = new THREE.BoxGeometry(1, 1, 1);
    this.geo = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geo, material);
    mesh.scale.setScalar(1.3);
    mesh.rotateX(Math.PI);
  }

  dispose(): void {
    this.geo.dispose();
  }
}

export async function makeWallObject(x: number, y: number) {
  return new WallObject(x, y);
}

export default WallObject;
