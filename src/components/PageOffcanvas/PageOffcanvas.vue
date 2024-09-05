<script setup>
import { OFFCANVAS_PLACEMENTS, offcanvasPlacementValidator } from '@/enums/placements'
import ButtonIcon from '@/components/Button/ButtonIcon'

const modelValue = defineModel({ type: Boolean })

defineProps({
  placement: {
    type: String,
    default: OFFCANVAS_PLACEMENTS.END,
    validator: offcanvasPlacementValidator
  },
  title: {
    type: String
  }
})
</script>

<template>
  <b-offcanvas
    v-model="modelValue"
    class="page-offcanvas"
    :placement="placement"
    hide-backdrop
    :title="title"
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
    <slot />
  </b-offcanvas>
</template>

<style lang="scss" scoped>
.page-offcanvas {
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
