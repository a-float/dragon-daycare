import * as THREE from "three";
import loadingManager from "../loadingManager";

// instantiate a loader
const loader = new THREE.TextureLoader(loadingManager);

async function loadTexture(url: string) {
  return await loader.loadAsync(url);
}

export default loadTexture;
