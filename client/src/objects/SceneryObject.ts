import * as THREE from "three";
import { MapState } from "../../../shared/gameState.js";
import { Disposable } from "./disposable.js";

import { makeWallObject } from "./WallObject.js";
import { makeDeviceObject } from "./DeviceObject.js";
import { makeStickyFloorObject } from "./StickyFloorObject.js";
import { Updatable } from "../components/UpdatableComponent.js";

class SceneryObject extends THREE.Group implements Disposable {
  disposableChildren: Disposable[] = [];
  updatable: Updatable[] = [];

  constructor(mapState: MapState) {
    super();

    for (let i = 0; i < mapState.width * mapState.height; ++i) {
      const x = i % mapState.width;
      const y = Math.floor(i / mapState.height);

      const tile = mapState.tiles[i];
      if (tile.device) {
        makeDeviceObject(x, y, tile.device).then((obj) => {
          this.add(obj);
          this.disposableChildren.push(obj);
          this.updatable.push(obj);
        });
      } else if (tile.isSticky) {
        makeStickyFloorObject(x, y).then((obj) => {
          this.add(obj);
          this.disposableChildren.push(obj);
        });
      } else if (tile.isWall) {
        makeWallObject(mapState, [x, y]).then((w) => {
          this.add(w);
          this.disposableChildren.push(w);
          // console.log(`Making wall`, w)  ;
        });
      }
    }
  }

  update(delta: number) {
    this.updatable.forEach((u) => u.update(delta));
  }

  dispose() {
    this.disposableChildren.forEach((c) => c.dispose());
  }
}

export async function makeSceneryObject(mapState: MapState) {
  return new SceneryObject(mapState);
}

export default SceneryObject;
