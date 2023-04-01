import "./style.css";
import ECS from "ecs-lib";
import * as THREE from "three";

import controls from "./utils/controls";
import PlayerEntity from "./entities/PlayerEntity";
import KeyboardSystem from "./systems/KeyboardSystem";
import { z } from "zod";
import { GameState } from "./gameState";

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
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 10;
camera.position.y = 5;
camera.lookAt(new THREE.Vector3(0, 0, 0));

const player1Mesh = createPlayerMesh("#cc2222");
const player2Mesh = createPlayerMesh("#2222cc");
const world = new ECS();
world.addSystem(new KeyboardSystem());
const player1 = new PlayerEntity(
  player1Mesh,
  new THREE.Vector3(0, 0, 0),
  controls.one
);
const player2 = new PlayerEntity(
  player2Mesh,
  new THREE.Vector3(1, 0, 0),
  controls.two
);
world.addEntity(player1);
world.addEntity(player2);
scene.add(player1Mesh);
scene.add(player2Mesh);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  world.update();
}

animate();
