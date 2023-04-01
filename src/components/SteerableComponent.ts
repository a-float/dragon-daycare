import { Component } from "ecs-lib";

export type Controls = {
  up: string;
  left: string;
  right: string;
  down: string;
  action: string;
};

export const SteerControlsComponent = Component.register<Controls>();

export type Steerable = { controlsIndex: number };

export const SteerableComponent = Component.register<Steerable>();
