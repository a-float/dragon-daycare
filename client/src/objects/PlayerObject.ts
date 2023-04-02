import * as THREE from "three";
import loadTexture from "../utils/loadTexture";
import { GameState } from "@dragon-daycare/shared/gameState";
import AbstractGameStateProvider from "../gameState/abstractGameStateProvider";

const ASSETS = Promise.all([loadTexture("/dragon/dragon-idle.png")]);

class PlayerObject extends THREE.Group {
  unsubscribes: (() => unknown)[] = [];

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
      new THREE.MeshBasicMaterial({ map: bodyTexture })
    );
    mesh.rotateX(Math.PI);
    mesh.rotateZ(Math.PI / 4);
    this.add(mesh);

    // eggSvg.rotateX(Math.PI);
    // bodySvg.scale.setScalar(0.01);
    // bodySvg.position.set(-1, -1, 0);
    // this.add(bodySvg);

    // setInterval(() => {
    //   this.rotateY(0.1);
    // }, 15);

    this.unsubscribes.push(
      gameStateProvider.subscribe((v) => this.onNewGameState(v))
    );
  }

  onNewGameState(gameState: GameState): void {
    const playerState = gameState.players[this.index];

    this.position.set(...playerState.pos, 0);
    this.setRotationFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      (playerState.dir * Math.PI) / 2
    );
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
