export enum Button {
  NO_BUTTON = 0,
  /* LMB */
  PRIMARY_BUTTON = 1,
  /* RMB */
  SECONDARY_BUTTON = 2,
  /* MMB */
  AUXILLARY_BUTTON = 4,
  /* Back */
  _4TH_BUTTON = 8,
  /* Forward */
  _5TH_BUTTON = 16,
}

export const isButton = (buttons: number, expectedButton: Button) => (buttons & expectedButton) === expectedButton
