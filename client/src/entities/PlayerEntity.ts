import { Entity } from "ecs-lib";
import {
  Controls,
  SteerableComponent,
  SteerControlsComponent,
} from "../components/SteerableComponent.js";
import { UpdatableComponent } from "../components/UpdatableComponent.js";
import PlayerObject from "../objects/PlayerObject.js";

export default class PlayerEntity extends Entity {
  constructor(
    controlsIndex: number,
    playerObject: PlayerObject,
    controls: Omit<Controls, "speed">
  ) {
    super();
    this.add(new SteerControlsComponent(controls));
    this.add(new SteerableComponent({ controlsIndex }));
    this.add(new UpdatableComponent(playerObject));
  }
}
