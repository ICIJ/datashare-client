<script setup>
import { computed } from 'vue'

import EmptyStateLabel from './EmptyStateLabel'
import EmptyStateAction from './EmptyStateAction'
import EmptyStateImage from './EmptyStateImage'

import { MODE_NAME } from '@/mode'
import { useMode } from '@/composables/useMode'

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
  actionModes: {
    type: Array,
    default: () => [MODE_NAME.SERVER, MODE_NAME.LOCAL, MODE_NAME.EMBEDDED]
  },
  actionVariant: {
    type: String,
    default: 'action'
  }
})

const { modeName } = useMode()

const hasAction = computed(() => {
  return props.actionModes.includes(modeName.value) && props.actionLabel && (props.actionHref || props.actionTo)
})
</script>

<template>
  <div class="empty-state d-flex flex-column align-items-center text-center py-4">
    <empty-state-label :label="label">
      <slot name="label" />
    </empty-state-label>
    <empty-state-action
      v-if="hasAction"
      :label="actionLabel"
      :icon="actionIcon"
      :href="actionHref"
      :target="actionTarget"
      :to="actionTo"
      :variant="actionVariant"
    >
      <slot name="action" />
    </empty-state-action>
    <empty-state-image v-if="image" :image="image" :image-dark="imageDark" :max-width="imageMaxWidth" :alt="imageAlt">
      <template #source>
        <slot name="image-source" />
      </template>
    </empty-state-image>
  </div>
</template>

<style lang="scss" scoped>
.empty-state {
  max-width: 500px;
  margin: 0 auto;
  gap: 2rem;
}
</style>
