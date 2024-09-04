export function getCategoryIcon(category) {
  return (
    {
      person: 'user-circle',
      organization: 'buildings',
      location: 'map-pin',
      email: 'envelope'
    }[category.toLowerCase()] || 'ban'
  )
}

export function getCategoryColor(category) {
  return `var(--bs-category-${category})`
}
