import * as THREE from "three";
import { MapState } from "../../../shared/gameState.js";
import { Disposable } from "./disposable.js";

import WallObject from "./WallObject.js";
import DeviceObject from "./DeviceObject.js";
import StickyFloor from "./StickyFloorObject.js";

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
      } else if (tile.isSticky) {
        const obj = new StickyFloor(x, y);
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
