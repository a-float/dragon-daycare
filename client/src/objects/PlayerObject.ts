import * as THREE from "three";

import {
  GameState,
  TICK_INVERVAL,
  TileCoord,
  lerpCoords,
  areCoordEqual,
} from "@dragon-daycare/shared";
import loadTexture from "../utils/loadTexture.js";
import AbstractGameStateProvider from "../gameState/abstractGameStateProvider.js";
import { PlayerState } from "@dragon-daycare/shared/gameState.js";
import { Spring } from "../utils/spring.js";
import { Easing } from "../utils/smoothValue.js";
import vertexShader from "./player.vert?raw";
import fragmentShader from "./player.frag?raw";

const ASSETS = Promise.all([loadTexture("/dragon/dragon-idle.png")]);

const colors = [0, 0.35, 0.5, 0.6, 0.1, 0.8, 0.75, 0.9] as const;
// const colors = ["#3b74ba", "#f04e32", "#f0609e", "#fbad18"] as const;

export type PlayerTransform = {
  prevPos: TileCoord | null;
  nextPos: TileCoord | null;
  interPos: number;

  prevAngle: number;
  nextAngle: number;
  interAngle: number;
};

export function stepPlayerTransform(
  prev: PlayerTransform,
  player: PlayerState
): PlayerTransform {
  const prevAngle = (prev.nextAngle + 4) % 4;
  const angleDiff = player.dir - prevAngle;

  let nextAngle: number = player.dir;
  if (angleDiff >= 3) {
    nextAngle = player.dir - 4;
  } else if (angleDiff <= -3) {
    nextAngle = player.dir + 4;
  }

  return {
    prevPos: [...(prev.nextPos ?? player.pos)],
    nextPos: [...player.pos],
    interPos: 0,

    prevAngle,
    nextAngle,
    interAngle: 0,
  };
}

export function advancePlayerTransform(curr: PlayerTransform, delta: number) {
  curr.interPos += delta / TICK_INVERVAL;
  if (curr.interPos > 1) {
    curr.interPos = 1;
  }

  if (
    !curr.prevPos ||
    !curr.nextPos ||
    !areCoordEqual(curr.prevPos, curr.nextPos)
  ) {
    curr.interAngle = 1;
  } else {
    curr.interAngle += delta / TICK_INVERVAL;
    if (curr.interAngle > 1) {
      curr.interAngle = 1;
    }
  }

  return {
    pos: lerpCoords(curr.prevPos!, curr.nextPos!, curr.interPos),
    angle: THREE.MathUtils.lerp(
      curr.prevAngle,
      curr.nextAngle,
      Easing.easeInOut(curr.interAngle)
    ),
  };
}

class PlayerObject extends THREE.Group {
  unsubscribes: (() => unknown)[] = [];

  private transform: PlayerTransform = {
    prevPos: null,
    nextPos: null,
    interPos: 0,

    prevAngle: 0,
    nextAngle: 0,
    interAngle: 0,
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

    let uniforms = {
      hueShift: { type: "float", value: colors[index] },
      map: { type: "t", value: bodyTexture },
    };

    let material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      transparent: true,
    });

    // const geo = new THREE.BoxGeometry(1, 1, 1);
    const geo = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geo, material);
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

    if (playerState.isMoving) {
      Spring.shift(this.squashSpring, 0.2, 0);
    } else {
      Spring.shift(this.squashSpring, 0, 0);
    }
  }

  update(delta: number) {
    const { pos, angle } = advancePlayerTransform(this.transform, delta);
    Spring.simulate(this.squashSpring, delta / 1000000);

    this.squashGroup.scale.set(
      1 - this.squashSpring.currX,
      1 + this.squashSpring.currX,
      1
    );

    this.turnGroup.setRotationFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      (angle * Math.PI) / 2
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
