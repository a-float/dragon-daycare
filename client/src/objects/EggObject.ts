import * as THREE from "three";

import { GameState, lerpCoords, TileCoord } from "@dragon-daycare/shared";
import AbstractGameStateProvider from "../gameState/abstractGameStateProvider";
import SmoothValue, { Easing } from "../utils/smoothValue";
import loadTexture from "../utils/loadTexture";
import {
  advancePlayerTransform,
  PlayerTransform,
  stepPlayerTransform,
} from "./PlayerObject";

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
  doneMesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
  crackMesh: THREE.Mesh<
    THREE.BufferGeometry,
    THREE.Material | THREE.Material[]
  >;
  private crackTextures: THREE.Texture[];
  private doneTextures: THREE.Texture[];

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
    this.crackTextures = [eggCrack03, eggCrack02, eggCrack01];
    this.doneTextures = [eggDone01, eggDone02, eggDone03]; // reversed direction lmaao
    const geo = new THREE.PlaneGeometry(1, 1);
    this.prepareMesh(geo, eggBase);
    this.doneMesh = this.prepareMesh(geo, eggDone01);
    this.doneMesh.visible = false;
    this.crackMesh = this.prepareMesh(geo, eggCrack01);
    this.crackMesh.visible = false;

    this.unsubscribes.push(
      gameStateProvider.subscribe((v) => this.onNewGameState(v))
    );
  }

  private prepareMesh(
    geo: THREE.BufferGeometry,
    map: THREE.Texture
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        map,
        transparent: true,
        premultipliedAlpha: false,
      })
    );
    mesh.scale.setScalar(0.7);
    mesh.translateZ(10);
    mesh.rotateX(Math.PI);
    this.add(mesh);
    return mesh;
  }

  private getDistFromRange(val: number, rangeMin: number, rangeMax: number) {
    return val < rangeMin
      ? val - rangeMin
      : val > rangeMax
      ? val - rangeMax
      : 0;
  }

  // doesnt work, I think
  // updateMeshes(hp: number, progress: number) {
  //   for (let i = 0; i < this.crackTextures.length; i++) {
  //     if (hp < (i + 1) / (this.crackTextures.length + 1)) {
  //       (this.crackMesh.material as any).map = this.crackTextures[i]; // TODO hacky typescript
  //       console.log("changing egg map");

  //       break;
  //     }
  //   }
  //   for (let i = this.doneTextures.length - 1; i >= 0; i--) {
  //     if (progress > (i + 1) / (this.crackTextures.length + 1)) {
  //       (this.doneMesh.material as any).map = this.doneTextures[i]; // TODO hacky typescript
  //       this.doneMesh.material
  //       console.log("changing done egg map"); 
  //       break;
  //     }
  //   }
  // }

  onNewGameState(gameState: GameState): void {
    const eggState = gameState.eggs.find((egg) => egg.id === this.eggId);
    if (!eggState) {
      throw new Error("Invalid egg id");
    }
    if (eggState.hp <= 0 || eggState.progress >= 1) return;
    // this.updateMeshes(eggState.hp, eggState.progress);
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
    const tempDiff = this.getDistFromRange(
      eggState.temp,
      ...eggState.hatchRange.temp
    );
    const wetnessDiff = this.getDistFromRange(
      eggState.wetness,
      ...eggState.hatchRange.wetness
    );

    if (tempDiff !== 0 || wetnessDiff !== 0) {
      if (Math.abs(tempDiff) > Math.abs(wetnessDiff)) {
        console.log(tempDiff > 0 ? "Too hot" : "Too cold");
      } else {
        console.log(wetnessDiff > 0 ? "Too wet" : "Too dry");
      }
    }

    // EGG STATS DEBUG
    // console.log({
    //   temp: Math.round(eggState.temp * 1000) / 1000,
    //   wetness: Math.round(eggState.wetness * 1000) / 1000,
    //   hp: Math.round(eggState.hp * 1000) / 1000,
    //   progress: eggState.progress,
    // });
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
