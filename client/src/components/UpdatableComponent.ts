import { Component } from "ecs-lib";

export interface Updatable {
  update(delta: number): void;
}

export const UpdatableComponent = Component.register<Updatable>();
