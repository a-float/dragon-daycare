import { Entity } from "ecs-lib";
import { Controls, SteerableComponent } from "../components/SteerableComponent";
import { Object3DComponent } from "../components/Object3DComponent";

export default class PlayerEntity extends Entity {
  constructor(
    mesh: THREE.Mesh,
    position: THREE.Vector3,
    controls: Omit<Controls, "speed">
  ) {
    super();
    mesh.position.copy(position);
    this.add(new SteerableComponent({ ...controls, speed: 0.3 }));
    this.add(new Object3DComponent(mesh));
  }
}
