import * as THREE from "three";

import { MapState } from "@dragon-daycare/shared";
import AbstractGameStateProvider from "../gameState/abstractGameStateProvider.js";
import loadTexture from "../utils/loadTexture.js";

const ASSETS = Promise.all([loadTexture("/forest-bg.png")]);

class BackdropObject extends THREE.Group {
  private aspectRatio: number = 1;
  unsubscribes: (() => unknown)[] = [];

  constructor(
    [bgTexture]: Awaited<typeof ASSETS>,
    gameStateProvider: AbstractGameStateProvider
  ) {
    super();

    this.aspectRatio = bgTexture.image.width / bgTexture.image.height;

    const geo = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(
      geo,
      // new THREE.MeshBasicMaterial({ color: "#0000ff" })
      new THREE.MeshBasicMaterial({
        map: bgTexture,
        depthWrite: false,
      })
    );
    mesh.rotateX(Math.PI);

    this.add(mesh);

    this.unsubscribes.push(
      gameStateProvider.subscribeMap((v) => this.onNewMapState(v))
    );
  }

  onNewMapState(mapState: MapState): void {
    this.position.set(mapState.width / 2 - 0.5, mapState.height / 2 - 0.5, 0);
    const scale = mapState.height * 1.6;
    this.scale.set(scale * this.aspectRatio, scale, 1);
  }

  dispose() {
    this.unsubscribes.forEach((u) => u());
  }
}

export async function makeBackdropObject(
  gameStateProvider: AbstractGameStateProvider
) {
  return new BackdropObject(await ASSETS, gameStateProvider);
}

export default BackdropObject;
