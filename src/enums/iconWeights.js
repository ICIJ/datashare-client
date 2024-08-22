const THIN = 'thin'
const LIGHT = 'light'
const REGULAR = 'regular'
const BOLD = 'bold'
const FILL = 'fill'
const DUOTONE = 'duotone'
export const ICON_WEIGHT = Object.freeze({
  THIN,
  LIGHT,
  REGULAR,
  BOLD,
  FILL,
  DUOTONE
})
export const ICON_WEIGHTS = Object.values(ICON_WEIGHT)
export const iconWeightValidator = (v) => ICON_WEIGHTS.includes(v)
