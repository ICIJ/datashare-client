<script setup>
import { computed } from 'vue'
import { round } from 'lodash'
import PhosphorIcon from '@/components/PhosphorIcon.vue'

import DisplayNumber from '@/components/Display/DisplayNumber'

const {
  count = 0,
  total = 0,
  to = null
} = defineProps({
  label: { type: String, required: true },
  count: { type: Number },
  total: { type: Number },
  to: { type: Object }
})

const is = computed(() => {
  return to ? 'router-link' : 'span'
})

const totalPercentage = computed(() => {
  if (total > 0) {
    return round((count / total) * 100, 2) + '%'
  }
  return '0%'
})

const barStyle = computed(() => {
  return { width: totalPercentage.value }
})
</script>

<template>
  <component
    :is="is"
    class="widget-field-facets-entry"
    :to="to"
  >
    <div class="d-flex align-items-center flex-truncate">
      <div class="widget-field-facets-entry__label text-truncate">
        <slot>{{ label }}</slot>
      </div>
      <span class="widget-field-facets-entry__count ms-auto flex-shrink-0">
        <phosphor-icon
          name="magnifying-glass"
          aria-hidden="true"
          weight="bold"
          class="me-2 flex-shrink-0 widget-field-facets-entry__count__icon"
        />
        <slot
          name="count"
          v-bind="{ count }"
        >
          <display-number :value="count" />
        </slot>
      </span>
    </div>
    <div
      class="widget-field-facets-entry__bar"
      :style="barStyle"
    />
  </component>
</template>

<style lang="scss" scoped>
@keyframes slidingBar {
  0% {
    max-width: 0;
  }
  100% {
    max-width: 100%;
  }
}

.widget-field-facets-entry {
  color: var(--bs-body-color);
  background: transparent;
  padding: $spacer-xs 0 $spacer-sm;
  position: relative;
  display: block;

  &[href] {
    color: var(--bs-link-color);

    &:hover .widget-field-facets-entry__count {
      color: var(--bs-white);
      background: var(--bs-action);
      border-radius: var(--bs-border-radius);

      &__icon {
        visibility: visible;
      }
    }
  }

  &__count {
    display: inline-flex;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    justify-content: space-between;
    align-items: center;
    padding: $spacer-xxs $spacer-xs;
    font-weight: 500;
    color: var(--bs-body-color);

    &__icon {
      color: inherit;
      display: inline-flex;
      visibility: hidden;
    }
  }

  &__bar {
    animation: slidingBar 200ms forwards;
    height: 8px;
    background: var(--bs-secondary-bg-subtle);
    position: absolute;
    left: 0;
    bottom: 0;
    min-width: 1px;
    max-width: 0;
    border-radius: 0 4px 4px 0;
  }

  @for $i from 0 through 100 {
    &:nth-child(#{$i}) &__bar {
      animation-delay: $i * 50ms;
    }
  }
}
</style>
