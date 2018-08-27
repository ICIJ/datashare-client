export const mixin = {
  methods: {
    getCategoryIcon (category = '') {
      return {
        person: 'id-badge',
        organization: 'building',
        location: 'map-marker-alt'
      }[category.toLowerCase()] || 'ban'
    },
    getCategoryClass (category = 'muted', prefix = '') {
      return `${prefix}category-${category.toLowerCase()}`
    }
  }
}

export default mixin
