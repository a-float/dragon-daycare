import "./style.css";
import ECS from "ecs-lib";
import * as THREE from "three";

import controls from "./utils/controls";
import PlayerEntity from "./entities/PlayerEntity";
import KeyboardSystem from "./systems/KeyboardSystem";
import { makeEggObject } from "./objects/EggObject";
import EggEntity from "./entities/EggEntity";
import GameAnchor from "./objects/GameAnchor";

const createPlayerMesh = (color: THREE.ColorRepresentation) => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color });
  return new THREE.Mesh(geometry, material);
};

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
scene.background = new THREE.Color("#ff22ff");
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

const player1Mesh = createPlayerMesh("#cc2222");
const player2Mesh = createPlayerMesh("#2222cc");
const world = new ECS();
world.addSystem(new KeyboardSystem());
const player1 = new PlayerEntity(
  player1Mesh,
  new THREE.Vector3(-3, 0, 0),
  controls.one
);
const player2 = new PlayerEntity(
  player2Mesh,
  new THREE.Vector3(3, 0, 0),
  controls.two
);
world.addEntity(player1);
world.addEntity(player2);
gameAnchor.add(player1Mesh);
gameAnchor.add(player2Mesh);

async function init() {
  // Egg
  const eggObj = await makeEggObject();
  const egg = new EggEntity(eggObj);
  gameAnchor.add(eggObj);
  world.addEntity(egg);

  // Scenery
  // const scenery = makeSceneryObject({ width: 16, height: 16 });
  // gameAnchor.add(scenery);
}

init();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  world.update();
}

animate();
