import DatashareClient from '@/api/DatashareClient'

const datashare = new DatashareClient()

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
    },
    deleteNamedEntitiesByMentionNorm (mentionNorm) {
      datashare.deleteNamedEntitiesByMentionNorm(mentionNorm)
    }
  }
}

export default mixin
