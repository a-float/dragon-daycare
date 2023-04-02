import * as THREE from "three";
import { Disposable } from "./disposable.js";
import { Device } from "../../../shared/gameState.js";

const colors: Record<Device, THREE.ColorRepresentation> = {
  dryer: "orange",
  freezer: "cyan",
  furnace: "red",
  moisturizer: "blueviolet",
};

class DeviceObject extends THREE.Group implements Disposable {
  geo: THREE.BoxGeometry;
  deviceType: Device;
  constructor(x: number, y: number, deviceType: Device) {
    super();
    this.deviceType = deviceType;
    this.position.set(x, y, 0);

    this.geo = new THREE.BoxGeometry(1, 1, 1);
    const mesh = new THREE.Mesh(
      this.geo,
      new THREE.MeshBasicMaterial({ color: colors[this.deviceType] })
    );
    this.add(mesh);
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
  return new DeviceObject(x, y, deviceType);
}

export default DeviceObject;
