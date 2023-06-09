import "./style.css";
import ECS from "ecs-lib";
import * as THREE from "three";

import controls from "./utils/controls.js";
import KeyboardSystem from "./systems/KeyboardSystem.js";
import GameAnchor from "./objects/GameAnchor.js";
import SceneryObject, { makeSceneryObject } from "./objects/SceneryObject.js";
import AbstractGameStateProvider from "./gameState/abstractGameStateProvider.js";
import PlayerEntity from "./entities/PlayerEntity.js";
import { makePlayerObject } from "./objects/PlayerObject.js";
import UpdatableSystem from "./systems/UpdatableSystem.js";
import EggEntity from "./entities/EggEntity.js";
import { makeEggObject } from "./objects/EggObject.js";
import { makeBackdropObject } from "./objects/BackdropObject.js";
import SceneryEntity from "./entities/SceneryEntity.js";
// import LocalGameStateProvider from "./gameState/localGameStateProvider.js";
import NetworkGameStateProvider from "./gameState/networkGameStateProvider.js";

// const createPlayerMesh = (color: THREE.ColorRepresentation) => {
//   const geometry = new THREE.BoxGeometry(1, 1, 1);
//   const material = new THREE.MeshBasicMaterial({ color });
//   return new THREE.Mesh(geometry, material);
// };

// const webSocket = new WebSocket(url, protocols);

// while (webSocket.CONNECTING) {
//   await new Promise((resolve) => setTimeout(resolve, 500));
// }

// webSocket.onmessage = (event) => {
//   const data = GameState.parse(event.data);
//   console.log(data);
// };

// const send = (msg: any) => {
//   webSocket.send(JSON.stringify(msg));
// };

const scene = new THREE.Scene();
scene.background = new THREE.Color("#081a1e");
// const camera = new THREE.OrthographicCamera(
//   0,
//   window.innerWidth,
//   0,
//   window.innerHeight,
//   -1000,
//   1000
// );
const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  -aspectRatio,
  aspectRatio,
  -1,
  1,
  -1000,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(2);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// camera.scale.setScalar(1000);
// camera.position.z = 10;
// camera.position.y = 5;
// camera.lookAt(new THREE.Vector3(0, 0, 0));
const gameAnchor = new GameAnchor();
scene.add(gameAnchor);

const gameStateProvider: AbstractGameStateProvider =
  new NetworkGameStateProvider();

// const player1Mesh = createPlayerMesh("#cc2222");
// const player2Mesh = createPlayerMesh("#2222cc");
// @ts-ignore
const world = new ECS();
world.addSystem(new KeyboardSystem(gameStateProvider));
world.addSystem(new UpdatableSystem());

async function createPlayers() {
  const player1Obj = await makePlayerObject(0, gameStateProvider);
  const player1 = new PlayerEntity(0, player1Obj, controls.one);
  world.addEntity(player1);
  gameAnchor.add(player1Obj);

  const player2Obj = await makePlayerObject(1, gameStateProvider);
  const player2 = new PlayerEntity(1, player2Obj, controls.two);
  world.addEntity(player2);
  gameAnchor.add(player2Obj);
}

async function init() {
  // Backdrop
  const backdropObj = await makeBackdropObject(gameStateProvider);
  gameAnchor.add(backdropObj);

  // Scenery
  let sceneryEntity: SceneryEntity | null = null;
  let scenery: SceneryObject | null = null;
  gameStateProvider.subscribeMap(async (state) => {
    if (scenery) {
      gameAnchor.remove(scenery);
      scenery.dispose();
      scenery = null;

      world.removeEntity(sceneryEntity);
      sceneryEntity = null;
    }

    scenery = await makeSceneryObject(state);
    gameAnchor.add(scenery);

    sceneryEntity = new SceneryEntity(scenery);
    world.addEntity(sceneryEntity);

    // Setting up camera
    camera.position.set(state.width / 2, state.height / 2, 0);
    camera.scale.setScalar(8);
  });

  //Players
  await createPlayers();
  // Egg
  const eggObj = await makeEggObject("Egg#1", gameStateProvider);
  const egg = new EggEntity(eggObj);
  gameAnchor.add(eggObj);
  world.addEntity(egg);

  // Egg 2
  const eggObj2 = await makeEggObject("Egg#2", gameStateProvider);
  const egg2 = new EggEntity(eggObj2);
  gameAnchor.add(eggObj2);
  world.addEntity(egg2);
}

function ui() {
  const heartElements = [
    document.getElementById("heart-1"),
    document.getElementById("heart-2"),
    document.getElementById("heart-3"),
  ];

  const hatches = document.getElementById("hatches");

  gameStateProvider.subscribe((state) => {
    heartElements.forEach((el, idx) => {
      if (idx < state.lifes) {
        el?.classList.add("ActiveHeart");
      } else {
        el?.classList.remove("ActiveHeart");
      }
    });

    if (hatches) hatches.innerHTML = `${state.hatched}`;
  });
}

init();

ui();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  world.update();
}

animate();
