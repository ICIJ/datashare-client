import { icon as faIcon } from '@fortawesome/fontawesome-svg-core'

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
    getCategoryIconSvg (category = '') {
      const iconName = this.getCategoryIcon(category)
      const iconRendering = faIcon({ prefix: 'fas', iconName })
      return iconRendering ? iconRendering.html[0] : null
    }
  }
}

export default mixin
