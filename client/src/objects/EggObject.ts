import * as THREE from "three";

import { GameState, lerpCoords, TileCoord } from "@dragon-daycare/shared";
import AbstractGameStateProvider from "../gameState/abstractGameStateProvider.js";
import SmoothValue, { Easing } from "../utils/smoothValue.js";
import loadTexture from "../utils/loadTexture.js";
import {
  advancePlayerTransform,
  PlayerTransform,
  stepPlayerTransform,
} from "./PlayerObject.js";

const ASSETS = Promise.all([
  loadTexture("/egg/egg_base.png"),
  loadTexture("/egg/egg_done-01.png"),
  loadTexture("/egg/egg_done-02.png"),
  loadTexture("/egg/egg_done-03.png"),
  loadTexture("/egg/egg_crack-01.png"),
  loadTexture("/egg/egg_crack-02.png"),
  loadTexture("/egg/egg_crack-03.png"),
]);

class EggObject extends THREE.Group {
  unsubscribes: (() => unknown)[] = [];

  eggPos: TileCoord = [0, 0];
  isHeld: boolean = false;
  holdingPlayerTransform: PlayerTransform = {
    prevPos: null,
    nextPos: null,
    interPos: 0,

    prevAngle: 0,
    nextAngle: 0,
    interAngle: 0,
  };
  private playerHoldFactor = new SmoothValue(0, Easing.easeOutQuad);

  constructor(
    [
      eggBase,
      eggDone01,
      eggDone02,
      eggDone03,
      eggCrack01,
      eggCrack02,
      eggCrack03,
    ]: Awaited<typeof ASSETS>,
    private eggId: string,
    gameStateProvider: AbstractGameStateProvider
  ) {
    super();

    const geo = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(
      geo,
      // new THREE.MeshBasicMaterial({ color: "#0000ff" })
      new THREE.MeshBasicMaterial({
        map: eggBase,
        transparent: true,
        premultipliedAlpha: false,
      })
    );
    mesh.scale.setScalar(0.6);
    mesh.translateZ(10);
    mesh.rotateX(Math.PI);

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
      this.holdingPlayerTransform = stepPlayerTransform(
        this.isHeld
          ? this.holdingPlayerTransform
          : {
              prevPos: null,
              nextPos: null,
              interPos: 0,

              prevAngle: 0,
              nextAngle: 0,
              interAngle: 0,
            },
        gameState.players[eggState.heldBy]
      );
      this.isHeld = true;
    } else {
      this.isHeld = false;
      this.eggPos = [...eggState.pos];
    }
    console.log({
      temp: Math.round(eggState.temp * 1000) / 1000,
      wetness: Math.round(eggState.wetness * 1000) / 1000,
      hp: Math.round(eggState.hp * 1000) / 1000,
    });
  }

  update(delta: number) {
    this.playerHoldFactor.advance(delta);

    let heldPos = this.holdingPlayerTransform.prevPos ?? this.eggPos;

    if (this.isHeld) {
      this.playerHoldFactor.to(1, 100);

      const { pos } = advancePlayerTransform(
        this.holdingPlayerTransform,
        delta
      );
      heldPos = pos;
    } else {
      this.playerHoldFactor.to(0, 100);
    }

    this.position.set(
      ...lerpCoords(this.eggPos, heldPos, this.playerHoldFactor.value),
      0
    );
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
