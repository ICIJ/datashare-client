import { PLACEMENTS } from '@/enums/placements'

const ACTION = 'action'
const PRIMARY = 'primary'
const SECONDARY = 'secondary'
const TERTIARY = 'tertiary'
const INFO = 'info'
const SUCCESS = 'success'
const WARNING = 'warning'
const DANGER = 'danger'
const LIGHT = 'light'
const DARK = 'dark'
const OUTLINE_ACTION = 'outline-action'
const OUTLINE_PRIMARY = 'outline-primary'
const OUTLINE_SECONDARY = 'outline-secondary'
const OUTLINE_TERTIARY = 'outline-tertiary'
const OUTLINE_INFO = 'outline-info'
const OUTLINE_SUCCESS = 'outline-success'
const OUTLINE_WARNING = 'outline-warning'
const OUTLINE_DANGER = 'outline-danger'
const OUTLINE_LIGHT = 'outline-light'
const OUTLINE_DARK = 'outline-dark'

export const VARIANT_PLAIN = Object.freeze({
  ACTION,
  PRIMARY,
  SECONDARY,
  TERTIARY,
  DANGER,
  INFO,
  SUCCESS,
  WARNING,
  LIGHT,
  DARK
})
export const VARIANT = Object.freeze({
  ACTION,
  PRIMARY,
  SECONDARY,
  TERTIARY,
  DANGER,
  INFO,
  SUCCESS,
  WARNING,
  LIGHT,
  DARK,
  OUTLINE_ACTION,
  OUTLINE_PRIMARY,
  OUTLINE_SECONDARY,
  OUTLINE_DANGER,
  OUTLINE_INFO,
  OUTLINE_SUCCESS,
  OUTLINE_WARNING,
  OUTLINE_TERTIARY,
  OUTLINE_DARK,
  OUTLINE_LIGHT
})
export const VARIANTS_PLAIN = Object.values(VARIANT_PLAIN)
export const variantPlainValidator = (v) => VARIANTS_PLAIN.includes(v)

export const VARIANTS = Object.values(VARIANT)
export const variantValidator = (v) => VARIANTS.includes(v)
