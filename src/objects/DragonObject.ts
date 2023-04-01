import THREE from "three";
import { SVGLoader } from "three-stdlib/loaders/SVGLoader.js";

// instantiate a loader
const loader = new SVGLoader();



// load a SVG resource
loader.load(
  // resource URL
  "public/egg_1-01.svg",
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
      }
    }

    scene.add(group);
  },
  // called when loading is in progresses
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  // called when loading has errors
  function (error) {
    console.log("An error happened");
  }
);
