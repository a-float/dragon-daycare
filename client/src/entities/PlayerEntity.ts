import { Entity } from "ecs-lib";
import {
  Controls,
  SteerableComponent,
  SteerControlsComponent,
} from "../components/SteerableComponent";
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
  }
}
