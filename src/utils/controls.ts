import { Controls } from '../components/SteerableComponent';

const controls = {
  one: {
    down: "s",
    left: "a",
    up: "w",
    right: "d",
    action: " ",
  },
  two: {
    down: "s",
    left: "a",
    up: "w",
    right: "d",
    action: "enter",
  },
} satisfies Record<string, Controls>;

export default controls;
