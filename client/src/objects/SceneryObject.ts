import * as THREE from "three";
import { MapState } from "../../../shared/gameState";
import { Disposable } from "./disposable";

import WallObject from "./WallObject";
import DeviceObject from "./DeviceObject";

class SceneryObject extends THREE.Group implements Disposable {
  disposableChildren: Disposable[] = [];

  constructor(mapState: MapState) {
    super();

    for (let i = 0; i < mapState.width * mapState.height; ++i) {
      const x = i % mapState.width;
      const y = Math.floor(i / mapState.height);

      const tile = mapState.tiles[i];
      if (tile.device) {
        const obj = new DeviceObject(x, y, tile.device);
        this.add(obj);
        this.disposableChildren.push(obj);
      } else if (tile.isWall) {
        const obj = new WallObject(x, y);
        this.add(obj);
        this.disposableChildren.push(obj);
      }
    }
  }

  dispose() {
    this.disposableChildren.forEach((c) => c.dispose());
  }
}

export async function makeSceneryObject(mapState: MapState) {
  return new SceneryObject(mapState);
}

export default SceneryObject;
