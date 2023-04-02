import * as THREE from "three";

import {
  GameState,
  TICK_INVERVAL,
  TileCoord,
  lerpCoords,
} from "@dragon-daycare/shared";
import loadTexture from "../utils/loadTexture";
import AbstractGameStateProvider from "../gameState/abstractGameStateProvider";
import { PlayerState } from "@dragon-daycare/shared/gameState";
import { Spring } from "../utils/spring";

const ASSETS = Promise.all([loadTexture("/dragon/dragon-idle.png")]);

const colors = ["#3b74ba", "#f04e32", "#f0609e", "#fbad18"] as const;

export type PlayerTransform = {
  prevPos: TileCoord | null;
  nextPos: TileCoord | null;
  interPos: number;
};

export function stepPlayerTransform(
  prev: PlayerTransform,
  player: PlayerState
): PlayerTransform {
  return {
    prevPos: [...(prev.nextPos ?? player.pos)],
    nextPos: [...player.pos],
    interPos: 0,
  };
}

export function advancePlayerTransform(curr: PlayerTransform, delta: number) {
  curr.interPos += delta / TICK_INVERVAL;
  if (curr.interPos > 1) {
    curr.interPos = 1;
  }

  return {
    pos: lerpCoords(curr.prevPos!, curr.nextPos!, curr.interPos),
  };
}

class PlayerObject extends THREE.Group {
  unsubscribes: (() => unknown)[] = [];

  private transform: PlayerTransform = {
    prevPos: null,
    nextPos: null,
    interPos: 0,
  };

  private turnGroup = new THREE.Group();
  private squashGroup = new THREE.Group();
  private squashSpring = Spring(0, 0, 5, 0.6, 0.7);

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

    this.add(this.turnGroup);
    this.turnGroup.add(this.squashGroup);
    this.squashGroup.add(mesh);

    this.unsubscribes.push(
      gameStateProvider.subscribe((v) => this.onNewGameState(v))
    );
  }

  onNewGameState(gameState: GameState): void {
    const playerState = gameState.players[this.index];

    this.transform = stepPlayerTransform(this.transform, playerState);

    this.turnGroup.setRotationFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      (playerState.dir * Math.PI) / 2
    );

    if (playerState.isMoving) {
      Spring.shift(this.squashSpring, 0.2, 0);
    } else {
      Spring.shift(this.squashSpring, 0, 0);
    }
  }

  update(delta) {
    const { pos } = advancePlayerTransform(this.transform, delta);
    Spring.simulate(this.squashSpring, delta / 1000000);

    console.log(this.squashSpring);

    this.squashGroup.scale.set(
      1 - this.squashSpring.currX,
      1 + this.squashSpring.currX,
      1
    );

    this.position.set(...pos, 0);
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
