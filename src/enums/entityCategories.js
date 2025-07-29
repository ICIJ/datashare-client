const PERSON = 'person'
const ORGANIZATION = 'organization'
const LOCATION = 'location'
const EMAIL = 'email'

export const ENTITY_CATEGORY = Object.freeze({
  PERSON,
  ORGANIZATION,
  LOCATION,
  EMAIL
})
export const ENTITY_CATEGORIES = Object.values(ENTITY_CATEGORY)
export const entityCategoryValidator = v => ENTITY_CATEGORIES.includes(v.toLowerCase())
