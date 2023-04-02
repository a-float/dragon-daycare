import { Entity } from "ecs-lib";
import { EggObjectComponent } from "../components/EggObjectComponent";
import { UpdatableComponent } from "../components/UpdatableComponent";
import EggObject from "../objects/EggObject";

export default class EggEntity extends Entity {
  constructor(eggObject: EggObject) {
    super();

    this.add(new EggObjectComponent(eggObject));
    this.add(new UpdatableComponent(eggObject));
  }
}
