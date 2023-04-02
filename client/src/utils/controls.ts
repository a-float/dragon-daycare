import { Controls } from "../components/SteerableComponent.js";

const controls = {
  one: {
    down: "s",
    left: "a",
    up: "w",
    right: "d",
    action: " ",
  },
  two: {
    down: "ArrowDown",
    left: "ArrowLeft",
    up: "ArrowUp",
    right: "ArrowRight",
    action: "Enter",
  },
} satisfies Record<string, Controls>;

export default controls;
