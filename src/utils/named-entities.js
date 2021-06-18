import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope'
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons/faMapMarkerAlt'
import { faBuilding } from '@fortawesome/free-solid-svg-icons/faBuilding'
import { faIdCardAlt } from '@fortawesome/free-solid-svg-icons/faIdCardAlt'

export function namedEntityIcon (category) {
  const icons = {
    emails: faEnvelope,
    email: faEnvelope,
    locations: faMapMarkerAlt,
    location: faMapMarkerAlt,
    organizations: faBuilding,
    organization: faBuilding,
    people: faIdCardAlt,
    person: faIdCardAlt
  }

  return icons[category.toLowerCase()]
}
