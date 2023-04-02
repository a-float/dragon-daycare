import * as THREE from "three";
import loadSvg from "../utils/loadSvg";
import AbstractGameStateProvider from "../gameState/abstractGameStateProvider";
import {
  Device,
  EggState,
  GameState,
  MapState,
  TICK_INVERVAL,
} from "../../../shared/gameState";

const ASSETS = Promise.all([loadSvg("/dragon/dragon-idle.svg")]);

class EggObject extends THREE.Group {
  unsubscribes: (() => unknown)[] = [];
  private mapState?: MapState;
  constructor(
    [bodySvg]: Awaited<typeof ASSETS>,
    private eggId: string,
    gameStateProvider: AbstractGameStateProvider
  ) {
    super();

    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: "#99aaff" })
    );
    mesh.rotateZ(Math.PI / 4);
    mesh.scale.setScalar(0.4);
    this.add(mesh);

    this.unsubscribes.push(
      gameStateProvider.subscribe((v) => this.onNewGameState(v))
    );
  }

  onNewGameState(gameState: GameState): void {
    const eggState = gameState.eggs.find((egg) => egg.id === this.eggId);
    if (!eggState) {
      throw new Error("Invalid egg id");
    }
    if (eggState.heldBy !== undefined) {
      this.position.set(...gameState.players[eggState.heldBy].pos, 0);
    } else {
      this.position.set(...eggState.pos, 0);
    }
    console.log({
      temp: Math.round(eggState.temp * 1000) / 1000,
      wetness: Math.round(eggState.wetness * 1000) / 1000,
      hp: Math.round(eggState.hp * 1000) / 1000,
    });
  }

  dispose() {
    this.unsubscribes.forEach((u) => u());
  }
}

export async function makeEggObject(
  eggId: string,
  gameStateProvider: AbstractGameStateProvider
) {
  return new EggObject(await ASSETS, eggId, gameStateProvider);
}

export default EggObject;
