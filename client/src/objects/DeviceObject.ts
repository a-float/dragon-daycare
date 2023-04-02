import * as THREE from "three";
import { Disposable } from "./disposable.js";
import { Device } from "../../../shared/gameState.js";
import loadTexture from "../utils/loadTexture.js";

const colors: Record<Device, THREE.ColorRepresentation> = {
  dryer: "orange",
  freezer: "cyan",
  furnace: "red",
  moisturizer: "blueviolet",
};

const ASSETS = Promise.all([
  loadTexture("/cauldron/cauldron.png"),
  loadTexture("/cauldron/boils-01.png"),
  loadTexture("/cauldron/boils-02.png"),
  loadTexture("/cauldron/boils-03.png"),
]);

class DeviceObject extends THREE.Group implements Disposable {
  geo: THREE.PlaneGeometry;
  boilsMaterial: THREE.MeshBasicMaterial;
  deviceType: Device;

  private boilsFrames: THREE.Texture[];
  private boilsFrame = 0;

  constructor(
    [baseTexture, boils1, boils2, boils3]: Awaited<typeof ASSETS>,
    x: number,
    y: number,
    deviceType: Device
  ) {
    super();

    this.boilsFrames = [boils1, boils2, boils3];

    this.deviceType = deviceType;
    this.position.set(x, y, 0);
    this.scale.setScalar(1.3);

    this.geo = new THREE.PlaneGeometry(1, 1);
    const baseMaterial = new THREE.MeshBasicMaterial({
      map: baseTexture,
      transparent: true,
    });
    const mesh = new THREE.Mesh(this.geo, baseMaterial);
    this.add(mesh);
    mesh.rotateX(Math.PI);

    this.boilsMaterial = new THREE.MeshBasicMaterial({
      color: colors[this.deviceType],
      map: this.boilsFrames[0],
      transparent: true,
    });
    const boilsMesh = new THREE.Mesh(this.geo, this.boilsMaterial);
    this.add(boilsMesh);
    boilsMesh.rotateX(Math.PI);
  }

  update(delta: number) {
    this.boilsFrame =
      (this.boilsFrame + (delta / 1000) * 10) % this.boilsFrames.length;

    this.boilsMaterial.map = this.boilsFrames[Math.floor(this.boilsFrame)];
    this.boilsMaterial.needsUpdate = true;
  }

  dispose(): void {
    this.geo.dispose();
  }
}

export async function makeDeviceObject(
  x: number,
  y: number,
  deviceType: Device
) {
  return new DeviceObject(await ASSETS, x, y, deviceType);
}

export default DeviceObject;
