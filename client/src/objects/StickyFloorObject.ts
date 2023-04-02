import * as THREE from "three";
import { Disposable } from "./disposable.js";

class StickyFloor extends THREE.Group implements Disposable {
  geo: THREE.BoxGeometry;

  constructor(x: number, y: number) {
    super();

    this.position.set(x, y, 0);

    this.geo = new THREE.BoxGeometry(1, 1, 1);
    const mesh = new THREE.Mesh(
      this.geo,
      new THREE.MeshBasicMaterial({ color: "#cacaca" })
    );
    this.add(mesh);
  }

  dispose(): void {
    this.geo.dispose();
  }
}

export async function makeStickyFloorObject(x: number, y: number) {
  return new StickyFloor(x, y);
}

export default StickyFloor;
