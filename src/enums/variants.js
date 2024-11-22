const ACTION = 'action'
const PRIMARY = 'primary'
const SECONDARY = 'secondary'
const TERTIARY = 'tertiary'
const INFO = 'info'
const SUCCESS = 'success'
const WARNING = 'warning'
const DANGER = 'danger'
const LINK = 'link'
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

const CATEGORY_BAN = 'category-ban'
const CATEGORY_PERSON = 'category-person'
const CATEGORY_ORGANIZATION = 'category-organization'
const CATEGORY_LOCATION = 'category-location'
const CATEGORY_EMAIL = 'category-email'

export const VARIANT_CATEGORY = Object.freeze({
  CATEGORY_BAN,
  CATEGORY_PERSON,
  CATEGORY_ORGANIZATION,
  CATEGORY_LOCATION,
  CATEGORY_EMAIL
})

export const VARIANT_PLAIN = Object.freeze({
  ACTION,
  PRIMARY,
  SECONDARY,
  TERTIARY,
  DANGER,
  INFO,
  SUCCESS,
  WARNING,
  LINK,
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
  LINK,
  LIGHT,
  DARK,
  CATEGORY_BAN,
  CATEGORY_PERSON,
  CATEGORY_ORGANIZATION,
  CATEGORY_LOCATION,
  CATEGORY_EMAIL,
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
