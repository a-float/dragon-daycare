import z from "zod";
import { TurnDirection } from "./gameState.js";

export type UserEvent = z.infer<typeof UserEvent>;
export const UserEvent = z.union([
  z.object({
    type: z.literal("move"),
    player: z.number().int(),
    dir: TurnDirection,
  }),
  z.object({
    type: z.literal("action"),
    player: z.number().int(),
  }),
]);
