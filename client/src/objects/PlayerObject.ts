import * as THREE from "three";
import loadSvg from "../utils/loadSvg";
import { GameState } from "../../../shared/gameState";
import AbstractGameStateProvider from "../gameState/abstractGameStateProvider";

const ASSETS = Promise.all([loadSvg("/dragon/dragon-idle.svg")]);

class PlayerObject extends THREE.Group {
  unsubscribes: (() => unknown)[] = [];

  constructor(
    [bodySvg]: Awaited<typeof ASSETS>,
    private index: number,
    gameStateProvider: AbstractGameStateProvider
  ) {
    super();

    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: "#0000ff" })
    );
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
  }

  dispose() {
    this.unsubscribes.forEach((u) => u());
  }
}

export async function makePlayerObject(
  index: number,
  gameStateProvider: AbstractGameStateProvider
) {
  return new PlayerObject(await ASSETS, index, gameStateProvider);
}

export default PlayerObject;
