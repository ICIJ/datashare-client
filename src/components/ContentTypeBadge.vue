<script>
import { get } from 'lodash'

import types from '@/utils/types'
import { findContentTypeIcon } from '@/utils/font-awesome-files'

/**
 * A small badge to display content type nicely.
 */
export default {
  name: 'ContentTypeBadge',
  props: {
    /**
     * Content type to display
     */
    value: {
      type: String
    },
    /**
     * Document name to extract the extension in case the content type is not reconized.
     */
    documentName: {
      type: String,
      default: null
    }
  },
  computed: {
    icon() {
      return findContentTypeIcon(this.value)
    },
    extension() {
      return get(types, [this.value, 'extensions', 0], this.extensionFallback)
    },
    extensionFallback() {
      if (this.documentName) {
        return '.' + this.documentName.split('.').pop()
      }
      return '.' + this.value.split('/').pop()
    },
    title() {
      const descriptions = get(types, [this.value, 'description'], {})
      return descriptions[this.$i18n.locale] || descriptions.en
    }
  }
}
</script>

<template>
  <span v-b-tooltip class="content-type-badge" :title="title">
    <fa :icon="icon" class="content-type-badge__icon" fixed-width />
    <span class="content-type-badge__extension">
      {{ extension }}
    </span>
  </span>
</template>

<style lang="scss">
.content-type-badge {
  padding: $badge-padding-y $badge-pill-padding-x;
  border: currentColor 1px solid;
  border-radius: $badge-pill-border-radius;
  font-weight: $badge-font-weight;
  background: $light;
  color: $text-muted;

  &__icon {
    color: $body-color;
  }
}
</style>
