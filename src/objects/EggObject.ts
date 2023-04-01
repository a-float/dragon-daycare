import * as THREE from "three";
import loadSvg from "../utils/loadSvg";

const ASSETS = Promise.all([
  loadSvg("public/egg_1-01.svg"),
  loadSvg("/bananas.svg"),
]);

class EggObject extends THREE.Group {
  constructor([eggSvg]: Awaited<typeof ASSETS>) {
    super();

    // eggSvg.rotateX(Math.PI);
    eggSvg.scale.setScalar(0.01);
    this.add(eggSvg);

    // const geo = new THREE.BoxGeometry(1, 1, 1);
    // const mesh = new THREE.Mesh(
    //   geo,
    //   new THREE.MeshBasicMaterial({ color: "#00ff00" })
    // );
    // this.add(mesh);

    // setInterval(() => {
    //   this.rotateY(0.1);
    // }, 15);
  }
}

export async function makeEggObject() {
  return new EggObject(await ASSETS);
}

export default EggObject;
