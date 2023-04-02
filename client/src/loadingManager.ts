import * as THREE from "three";

const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
  console.log(`Started loading file: ${url}. (${itemsLoaded}/${itemsTotal})`);
};

loadingManager.onLoad = function () {
  console.log("Loading complete!");
};

// loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
//   console.log(`Loading file: ${url}. (${itemsLoaded}/${itemsTotal})`);
// };

loadingManager.onError = function (url) {
  console.log(`There was an error loading ${url}`);
};

export default loadingManager;
