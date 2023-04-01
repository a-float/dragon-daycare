import { Entity, System } from "ecs-lib";
import KeyboardState from "../utils/KeyboardState";
import { Object3DComponent } from "../components/Object3DComponent";
import { SteerableComponent } from "../components/SteerableComponent";

export default class KeyboardSystem extends System {
  constructor() {
    super([Object3DComponent.type, SteerableComponent.type]);
  }

  update(time: number, delta: number, entity: Entity): void {
    const object3D = Object3DComponent.oneFrom(entity).data;
    const { speed, ...controls } = SteerableComponent.oneFrom(entity).data;

    const diff = delta * speed / 50;

    if (KeyboardState.pressed(controls.right)) {
      object3D.translateX(diff);
    } else if (KeyboardState.pressed(controls.left)) {
      object3D.translateX(-diff);
    } else if (KeyboardState.pressed(controls.up)) {
      object3D.translateZ(-diff);
    } else if (KeyboardState.pressed(controls.down)) {
      object3D.translateZ(diff);
    }
  }
}
