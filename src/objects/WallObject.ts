import * as THREE from "three";

class WallObject extends THREE.Group {
  constructor(x: number, y: number) {
    super();

    this.position.set(x, y, 0);

    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: "#00ff00" })
    );
    this.add(mesh);
  }
}

export async function makeWallObject(x: number, y: number) {
  return new WallObject(x, y);
}

export default WallObject;
