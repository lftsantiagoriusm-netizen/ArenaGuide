import type { ShieldStrategy } from "../domain/types";

export const firstChargedShieldStrategy: ShieldStrategy = {
  id: "first-charged",
  name: "Proteger el primer cargado disponible",
  shouldShield: (state) => state.shields > 0,
};
