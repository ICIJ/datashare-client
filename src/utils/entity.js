import IPhUserCircle from '~icons/ph/user-circle'
import IPhBuildings from '~icons/ph/buildings'
import IPhMapPin from '~icons/ph/map-pin'
import IPhEnvelope from '~icons/ph/envelope'
import IPhProhibit from '~icons/ph/prohibit'

import { VARIANT } from '@/enums/variants'

export function getCategoryIcon(category) {
  return (
    {
      person: IPhUserCircle,
      persons: IPhUserCircle,
      people: IPhUserCircle,
      organization: IPhBuildings,
      organizations: IPhBuildings,
      location: IPhMapPin,
      locations: IPhMapPin,
      email: IPhEnvelope,
      emails: IPhEnvelope
    }[category.toLowerCase()] || IPhProhibit
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
