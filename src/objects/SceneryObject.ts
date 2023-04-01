import * as THREE from "three";
import { MapState } from "../gameState";

import WallObject from "./WallObject";

class SceneryObject extends THREE.Group {
  constructor(mapState: MapState) {
    super();

    for (let i = 0; i < mapState.width * mapState.height; ++i) {
      const x = i % mapState.width;
      const y = Math.floor(i / mapState.height);

      this.add(new WallObject(x, y));
    }
  }
}

export async function makeSceneryObject(mapState: MapState) {
  return new SceneryObject(mapState);
}

export default SceneryObject;
