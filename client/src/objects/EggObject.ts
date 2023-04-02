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
  loadTexture("/egg_needs/hot.png"),
  loadTexture("/egg_needs/cold.png"),
  loadTexture("/egg_needs/wet.png"),
  loadTexture("/egg_needs/dry.png"),
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
  doneMeshes: THREE.Mesh[];
  crackMeshes: THREE.Mesh[];
  private statusBadges: Record<"dry" | "wet" | "cold" | "hot", THREE.Mesh>;

  constructor(
    [
      eggBase,
      eggDone01,
      eggDone02,
      eggDone03,
      eggCrack01,
      eggCrack02,
      eggCrack03,
      hotImg,
      coldImg,
      wetImg,
      dryImg,
    ]: Awaited<typeof ASSETS>,
    private eggId: string,
    gameStateProvider: AbstractGameStateProvider
  ) {
    super();
    const geo = new THREE.PlaneGeometry(1, 1);
    this.prepareMesh(geo, eggBase);
    this.crackMeshes = [eggCrack03, eggCrack02, eggCrack01].map((txt) =>
      this.prepareMesh(geo, txt)
    );
    this.doneMeshes = [eggDone01, eggDone02, eggDone03].map((txt) =>
      this.prepareMesh(geo, txt)
    );
    [...this.crackMeshes, ...this.doneMeshes].forEach(
      (m) => (m.visible = false)
    );

    const badgeGeo = new THREE.PlaneGeometry(0.8, 0.8);
    this.statusBadges = {
      dry: this.prepareMesh(badgeGeo, dryImg),
      wet: this.prepareMesh(badgeGeo, wetImg),
      cold: this.prepareMesh(badgeGeo, coldImg),
      hot: this.prepareMesh(badgeGeo, hotImg),
    };
    Object.values(this.statusBadges).forEach((m) => {
      m.translateY(0.15);
      m.translateX(0.02);
      m.visible = false;
    });

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
  updateMeshes(hp: number, progress: number) {
    [...this.crackMeshes, ...this.doneMeshes].forEach(
      (m) => (m.visible = false)
    );
    for (let i = 0; i < this.crackMeshes.length; i++) {
      if (hp < (i + 1) / (this.crackMeshes.length + 1)) {
        this.crackMeshes[i].visible = true;
        break;
      }
    }
    for (let i = this.doneMeshes.length - 1; i >= 0; i--) {
      if (progress > (i + 1) / (this.doneMeshes.length + 1)) {
        this.doneMeshes[i].visible = true;
        break;
      }
    }
  }

  onNewGameState(gameState: GameState): void {
    const eggState = gameState.eggs.find((egg) => egg.id === this.eggId);
    if (!eggState) {
      throw new Error("Invalid egg id");
    }
    if (eggState.hp <= 0 || eggState.progress >= 1) return;
    this.updateMeshes(eggState.hp, eggState.progress);
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

    Object.values(this.statusBadges).forEach((m) => {
      m.visible = false;
    });
    if (tempDiff !== 0) {
      (tempDiff > 0 ? this.statusBadges.hot : this.statusBadges.cold).visible =
        true;
      console.log(tempDiff > 0 ? "Too hot" : "Too cold");
    } else if (wetnessDiff !== 0) {
      console.log(wetnessDiff > 0 ? "Too wet" : "Too dry");
      (wetnessDiff > 0
        ? this.statusBadges.wet
        : this.statusBadges.dry
      ).visible = true;
    }

    // EGG STATS DEBUG
    console.log({
      temp: Math.round(eggState.temp * 1000) / 1000,
      wetness: Math.round(eggState.wetness * 1000) / 1000,
      hp: Math.round(eggState.hp * 1000) / 1000,
      progress: eggState.progress,
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
