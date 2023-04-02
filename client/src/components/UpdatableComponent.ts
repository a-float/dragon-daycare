import { Component } from "ecs-lib";

export interface Updatable {
  update(delta: number);
}

export const UpdatableComponent = Component.register<Updatable>();
