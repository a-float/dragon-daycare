import { Entity, System } from "ecs-lib";

import { UpdatableComponent } from "../components/UpdatableComponent";

export default class UpdatableSystem extends System {
  constructor() {
    super([UpdatableComponent.type]);
  }

  update(_time: number, delta: number, entity: Entity): void {
    const updatable = UpdatableComponent.oneFrom(entity).data;

    updatable.update(delta);
  }
}
