import { Entity } from "ecs-lib";
import {
  Controls,
  SteerableComponent,
  SteerControlsComponent,
} from "../components/SteerableComponent";
import { UpdatableComponent } from "../components/UpdatableComponent";
import PlayerObject from "../objects/PlayerObject";

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
