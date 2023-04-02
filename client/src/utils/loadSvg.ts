import * as THREE from "three";
import { SVGLoader } from "three-stdlib/loaders/SVGLoader.js";
import loadingManager from "../loadingManager.js";

// instantiate a loader
const loader = new SVGLoader(loadingManager);

function loadSvg(url: string) {
  return new Promise<THREE.Group>((resolve, reject) => {
    // load a SVG resource
    loader.load(
      // resource URL
      url,
      // called when the resource is loaded
      function (data) {
        const paths = data.paths;
        const group = new THREE.Group();

        for (let i = 0; i < paths.length; i++) {
          const path = paths[i];

          const material = new THREE.MeshBasicMaterial({
            color: path.color,
            side: THREE.DoubleSide,
            depthWrite: false,
          });

          const shapes = SVGLoader.createShapes(path);

          for (let j = 0; j < shapes.length; j++) {
            const shape = shapes[j];
            const geometry = new THREE.ShapeGeometry(shape);
            const mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);
            // console.log(geometry);
          }
        }

        resolve(group);
      },
      // called when loading is in progresses
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // called when loading has errors
      function (error) {
        reject(error);
      }
    );
  });
}

export default loadSvg;
