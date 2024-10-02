import { VARIANT } from '@/enums/variants'

export function getCategoryIcon(category) {
  return (
    {
      person: 'user-circle',
      persons: 'user-circle',
      people: 'user-circle',
      organization: 'buildings',
      organizations: 'buildings',
      location: 'map-pin',
      locations: 'map-pin',
      email: 'envelope',
      emails: 'envelope'
    }[category.toLowerCase()] || 'ban'
  )
}

export function getCategoryVariant(category) {
  return {
    person: VARIANT.CATEGORY_PERSON,
    persons: VARIANT.CATEGORY_PERSON,
    people: VARIANT.CATEGORY_PERSON,
    organization: VARIANT.CATEGORY_ORGANIZATION,
    organizations: VARIANT.CATEGORY_ORGANIZATION,
    location: VARIANT.CATEGORY_LOCATION,
    locations: VARIANT.CATEGORY_LOCATION,
    email: VARIANT.CATEGORY_EMAIL,
    emails: VARIANT.CATEGORY_EMAIL
  }[category.toLowerCase()]
}

export function getCategoryColor(category) {
  return `var(--bs-category-${category})`
}
