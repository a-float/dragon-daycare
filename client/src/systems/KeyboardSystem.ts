import { Entity, System } from "ecs-lib";

import KeyboardState from "../utils/KeyboardState";
import {
  SteerableComponent,
  SteerControlsComponent,
} from "../components/SteerableComponent";
import AbstractGameStateProvider from "../gameState/abstractGameStateProvider";
import { TurnDirection } from "../../../shared/gameState";

export default class KeyboardSystem extends System {
  moveDir: TurnDirection | null = null;

  constructor(private gameStateProvider: AbstractGameStateProvider) {
    super([SteerControlsComponent.type, SteerableComponent.type]);
  }

  update(_time: number, _delta: number, entity: Entity): void {
    const controls = SteerControlsComponent.oneFrom(entity).data;
    const { controlsIndex } = SteerableComponent.oneFrom(entity).data;

    const prevMoveDir = this.moveDir;

    if (KeyboardState.pressedWithClear(controls.right)) {
      this.moveDir = 1;
    } else if (KeyboardState.pressedWithClear(controls.left)) {
      this.moveDir = 3;
    } else if (KeyboardState.pressedWithClear(controls.up)) {
      this.moveDir = 0;
    } else if (KeyboardState.pressedWithClear(controls.down)) {
      this.moveDir = 2;
    } else if (KeyboardState.pressedWithClear(controls.action)) {
      this.gameStateProvider.sendEvent({
        type: "action",
        player: controlsIndex,
      });
      return;
    } else {
      this.moveDir = null;
    }

    if (this.moveDir !== null && this.moveDir !== prevMoveDir) {
      this.gameStateProvider.sendEvent({
        type: "move",
        dir: this.moveDir,
        player: controlsIndex,
      });
    }
  }
}
