import * as THREE from "three";
import loadSvg from "../utils/loadSvg";
import { GameState } from "../../../shared/gameState";
import AbstractGameStateProvider from "../gameState/abstractGameStateProvider";

const ASSETS = Promise.all([loadSvg("/dragon/dragon-idle.svg")]);

const colors = ["#3b74ba", "#f04e32", "#f0609e", "#fbad18"] as const;

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
      new THREE.MeshBasicMaterial({ color: colors[index] })
    );
    mesh.scale.setScalar(0.7);
    mesh.rotateZ(Math.PI / 4);
    this.add(mesh);

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
