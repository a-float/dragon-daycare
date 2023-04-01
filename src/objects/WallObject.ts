import * as THREE from "three";
import { Disposable } from "./disposable";

class WallObject extends THREE.Group implements Disposable {
  geo: THREE.BoxGeometry;

  constructor(x: number, y: number) {
    super();

    this.position.set(x, y, 0);

    this.geo = new THREE.BoxGeometry(1, 1, 1);
    const mesh = new THREE.Mesh(
      this.geo,
      new THREE.MeshBasicMaterial({ color: "#00ff00" })
    );
    this.add(mesh);
  }

  dispose(): void {
    this.geo.dispose();
  }
}

export async function makeWallObject(x: number, y: number) {
  return new WallObject(x, y);
}

export default WallObject;
