import * as THREE from "three";

import {
  GameState,
  TICK_INVERVAL,
  TileCoord,
} from "@dragon-daycare/shared/gameState";
import loadTexture from "../utils/loadTexture";
import AbstractGameStateProvider from "../gameState/abstractGameStateProvider";

const ASSETS = Promise.all([loadTexture("/dragon/dragon-idle.png")]);

class PlayerObject extends THREE.Group {
  unsubscribes: (() => unknown)[] = [];

  private prevPos: TileCoord | null = null;
  private nextPos: TileCoord | null = null;
  private posInter: number = 0;

  constructor(
    [bodyTexture]: Awaited<typeof ASSETS>,
    gameStateProvider: AbstractGameStateProvider,
    private index: number
  ) {
    super();

    // const geo = new THREE.BoxGeometry(1, 1, 1);
    const geo = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(
      geo,
      // new THREE.MeshBasicMaterial({ color: "#0000ff" })
      new THREE.MeshBasicMaterial({
        map: bodyTexture,
        transparent: true,
        premultipliedAlpha: false,
      })
    );
    mesh.scale.setScalar(1.3);
    mesh.rotateX(Math.PI);
    this.add(mesh);

    this.unsubscribes.push(
      gameStateProvider.subscribe((v) => this.onNewGameState(v))
    );
  }

  onNewGameState(gameState: GameState): void {
    const playerState = gameState.players[this.index];

    this.prevPos = [...(this.nextPos ?? playerState.pos)];
    this.nextPos = [...playerState.pos];
    this.posInter = 0;

    this.setRotationFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      (playerState.dir * Math.PI) / 2
    );
  }

  update(delta) {
    this.posInter += delta / TICK_INVERVAL;
    if (this.posInter > 1) {
      this.posInter = 1;
    }

    if (this.nextPos && this.prevPos) {
      this.position.set(
        this.nextPos[0] * this.posInter + this.prevPos[0] * (1 - this.posInter),
        this.nextPos[1] * this.posInter + this.prevPos[1] * (1 - this.posInter),
        0
      );
    }
  }

  dispose() {
    this.unsubscribes.forEach((u) => u());
  }
}

export async function makePlayerObject(
  index: number,
  gameStateProvider: AbstractGameStateProvider
) {
  return new PlayerObject(await ASSETS, gameStateProvider, index);
}

export default PlayerObject;
