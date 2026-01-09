<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur-next'

defineOptions({ name: 'BatchSearchCardDetailsEntry' })

const props = defineProps({
  icon: {
    type: [String, Object, Array]
  },
  label: {
    type: String
  },
  value: {
    type: String
  },
  buttons: {
    type: Boolean,
    default: false
  }
})

const classList = computed(() => {
  return {
    'batch-search-card-details-entry--buttons': props.buttons
  }
})
</script>

<template>
  <div
    class="batch-search-card-details-entry d-flex align-items-center justify-content-between gap-2"
    :title="label"
    :class="classList"
  >
    <div class="d-flex flex-nowrap align-items-start gap-2">
      <app-icon
        v-if="icon"
        :name="icon"
        class="batch-search-card-details-entry__icon text-secondary-emphasis flex-shrink-0"
      />
      <slot>{{ value }}</slot>
    </div>
    <div>
      <slot name="end" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.batch-search-card-details-entry {
  &__icon {
    width: 1.75rem;
    padding: 0.12rem 0;
  }

  &--buttons &__icon {
    padding: 0.75rem 0;
  }
}
</style>
