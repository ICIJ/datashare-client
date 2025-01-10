<script setup>
import { computed } from 'vue'

import EmptyStateLabel from './EmptyStateLabel'
import EmptyStateAction from './EmptyStateAction'
import EmptyStateImage from './EmptyStateImage'

const props = defineProps({
  label: {
    type: String
  },
  image: {
    type: String,
    required: false
  },
  imageDark: {
    type: String
  },
  imageAlt: {
    type: String
  },
  imageMaxWidth: {
    type: String,
    default: '200px'
  },
  actionLabel: {
    type: String
  },
  actionIcon: {
    type: [String, Object, Array]
  },
  actionHref: {
    type: String
  },
  actionTarget: {
    type: String
  },
  actionTo: {
    type: Object
  },
  actionVariant: {
    type: String,
    default: 'action'
  }
})

const hasAction = computed(() => {
  return props.actionLabel && (props.actionHref || props.actionTo)
})
</script>

<template>
  <div class="empty-state d-flex flex-column align-items-center text-center gap-5 py-4">
    <empty-state-label :label="label">
      <slot name="label" />
    </empty-state-label>
    <empty-state-image v-if="image" :image="image" :image-dark="imageDark" :max-width="imageMaxWidth" :alt="imageAlt">
      <template #source>
        <slot name="image-source" />
      </template>
    </empty-state-image>
    <empty-state-action
      v-if="hasAction"
      :label="actionLabel"
      :icon="actionIcon"
      :href="actionHref"
      :target="actionTarget"
      :to="actionTo"
      :variant="variant"
    >
      <slot name="action" />
    </empty-state-action>
  </div>
</template>

<style lang="scss" scoped>
.empty-state {
  max-width: 400px;
  margin: 0 auto;
}
</style>
