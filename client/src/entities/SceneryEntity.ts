import { Entity } from "ecs-lib";
import { UpdatableComponent } from "../components/UpdatableComponent.js";
import SceneryObject from "../objects/SceneryObject.js";

export default class SceneryEntity extends Entity {
  constructor(obj: SceneryObject) {
    super();

    this.add(new UpdatableComponent(obj));
  }
}
