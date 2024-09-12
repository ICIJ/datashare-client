<script setup>
import { computed } from 'vue'

import { OFFCANVAS_PLACEMENT, offcanvasPlacementValidator } from '@/enums/placements'
import { useBreakpoints } from '@/composables/breakpoints'
import { breakpointSizeValidator, SIZE } from '@/enums/sizes'
import ButtonIcon from '@/components/Button/ButtonIcon'

const modelValue = defineModel({ type: Boolean })

const props = defineProps({
  placement: {
    type: String,
    default: OFFCANVAS_PLACEMENT.END,
    validator: offcanvasPlacementValidator
  },
  title: {
    type: String
  },
  compactBreakpoint: {
    type: String,
    default: SIZE.MD,
    validator: breakpointSizeValidator
  }
})

const { breakpointDown } = useBreakpoints()

const compact = computed(() => {
  return breakpointDown.value[props.compactBreakpoint]
})

const classList = computed(() => {
  return {
    'page-offcanvas--compact': compact.value
  }
})
</script>

<template>
  <b-offcanvas
    v-model="modelValue"
    :placement="placement"
    :title="title"
    :class="classList"
    class="page-offcanvas"
    header-class="page-offcanvas__header"
  >
    <template #header="{ hide }">
      <h5 v-if="title" class="page-offcanvas__header__title m-0">{{ title }}</h5>
      <button-icon
        icon-left="x"
        icon-left-size="1.5em"
        variant="outline-secondary"
        square
        hide-label
        hide-tooltip
        class="page-offcanvas__header__close border-0 ms-auto"
        @click="hide"
      />
    </template>
    <template #default="{ visible, hide }">
      <slot v-bind="{ visible, placement, hide }" />
    </template>
  </b-offcanvas>
</template>

<style lang="scss">
.page-offcanvas {
  &--compact.offcanvas {
    --bs-offcanvas-padding-x: #{$spacer};
    --bs-offcanvas-width: 100%;
  }

  &__header {
    &__title {
      color: var(--bs-body-color);
      font-size: 20px;
      font-weight: 700;
      line-height: 24px;
    }
  }
}
</style>
