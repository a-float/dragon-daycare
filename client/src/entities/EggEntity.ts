import { Entity } from "ecs-lib";
import { EggObjectComponent } from "../components/EggObjectComponent.js";
import { UpdatableComponent } from "../components/UpdatableComponent.js";
import EggObject from "../objects/EggObject.js";

export default class EggEntity extends Entity {
  constructor(eggObject: EggObject) {
    super();

    this.add(new EggObjectComponent(eggObject));
    this.add(new UpdatableComponent(eggObject));
  }
}
