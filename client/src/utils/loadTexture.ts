import * as THREE from "three";
import loadingManager from "../loadingManager.js";

// instantiate a loader
const loader = new THREE.TextureLoader(loadingManager);

async function loadTexture(url: string) {
  const texture = await loader.loadAsync(url);

  // texture.minFilter = THREE.LinearFilter;
  // texture.magFilter = THREE.LinearFilter;

  return texture;
}

export default loadTexture;
