import * as THREE from "three";
import loadTexture from "../utils/loadTexture.js";
import { Disposable } from "./disposable.js";

const ASSETS = Promise.all([loadTexture("/sticky-floor.png")]);

class StickyFloor extends THREE.Group implements Disposable {
  geo: THREE.PlaneGeometry;

  constructor([texture]: Awaited<typeof ASSETS>, x: number, y: number) {
    super();

    this.position.set(x, y, 0);

    this.geo = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(
      this.geo,
      new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    this.add(mesh);
    mesh.scale.setScalar(1.5);
    mesh.rotateX(Math.PI);
  }

  dispose(): void {
    this.geo.dispose();
  }
}

export async function makeStickyFloorObject(x: number, y: number) {
  return new StickyFloor(await ASSETS, x, y);
}

export default StickyFloor;
