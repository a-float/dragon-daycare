import { Entity } from "ecs-lib";
import { EggObjectComponent } from "../components/EggObjectComponent";
import EggObject from "../objects/EggObject";

export default class EggEntity extends Entity {
  constructor(eggObject: EggObject) {
    super();

    this.add(new EggObjectComponent(eggObject));
  }
}
