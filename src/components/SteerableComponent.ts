import { Component } from "ecs-lib";

export type Controls = {
  up: string;
  left: string;
  right: string;
  down: string;
  action: string;
};

export type Steerable = Controls & { speed: number };

export const SteerableComponent = Component.register<Steerable>();
