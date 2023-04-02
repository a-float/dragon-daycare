import "./style.css";
import ECS from "ecs-lib";
import * as THREE from "three";

import controls from "./utils/controls";
import KeyboardSystem from "./systems/KeyboardSystem";
import GameAnchor from "./objects/GameAnchor";
import SceneryObject, { makeSceneryObject } from "./objects/SceneryObject";
import LocalGameStateProvider from "./gameState/localGameStateProvider";
import AbstractGameStateProvider from "./gameState/abstractGameStateProvider";
import PlayerEntity from "./entities/PlayerEntity";
import { makePlayerObject } from "./objects/PlayerObject";
import EggEntity from "./entities/EggEntity";
import { makeEggObject } from "./objects/EggObject";

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
scene.background = new THREE.Color("#ddd");
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

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// camera.scale.setScalar(1000);
// camera.position.z = 10;
// camera.position.y = 5;
// camera.lookAt(new THREE.Vector3(0, 0, 0));
const gameAnchor = new GameAnchor();
scene.add(gameAnchor);

const gameStateProvider: AbstractGameStateProvider =
  new LocalGameStateProvider();

// const player1Mesh = createPlayerMesh("#cc2222");
// const player2Mesh = createPlayerMesh("#2222cc");
const world = new ECS();
world.addSystem(new KeyboardSystem(gameStateProvider));

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
  //Players
  await createPlayers();
  // Egg
  const eggObj = await makeEggObject("Egg#1", gameStateProvider);
  const egg = new EggEntity(eggObj);
  gameAnchor.add(eggObj);
  world.addEntity(egg);

  // Scenery
  let scenery: SceneryObject | null = null;
  gameStateProvider.subscribeMap(async (state) => {
    if (scenery) {
      gameAnchor.remove(scenery);
      scenery.dispose();
      scenery = null;
    }

    scenery = await makeSceneryObject(state);
    gameAnchor.add(scenery);

    // Setting up camera
    camera.position.set(state.width / 2, state.height / 2, 0);
    camera.scale.setScalar(10);
  });
}

init();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  world.update();
}

animate();
