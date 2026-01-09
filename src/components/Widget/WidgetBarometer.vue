<template>
  <b-card
    :tag="tag"
    :href="href"
    :border-variant="borderVariant"
    :class="classList"
    class="widget-barometer"
    body-class="d-flex flex-column flex-truncate text-center gap-1 "
  >
    <app-icon
      :variant="variant"
      size="2rem"
      :name="icon"
    />
    <div class="widget-barometer__value fw-bold text-truncate w-100">
      <slot>
        <display-number-human
          v-if="isNumber"
          :value="value"
        />
        <template v-else>
          {{ value }}
        </template>
      </slot>
    </div>
    <div class="widget-barometer__label text-truncate w-100">
      <slot name="label">
        {{ label }}
      </slot>
    </div>
  </b-card>
</template>

<script setup>
import { isString, isObject } from 'lodash'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppIcon } from '@icij/murmur-next'

import DisplayNumberHuman from '@/components/Display/DisplayNumberHuman'
import { variantValidator } from '@/enums/variants'

const props = defineProps({
  icon: { type: [String, Object, Array] },
  value: { type: [Number, String] },
  label: { type: String },
  to: { type: [String, Object], default: null },
  clickable: { type: Boolean, default: false },
  variant: { type: String, validator: variantValidator, default: null },
  borderVariant: { type: String, validator: variantValidator, default: null }
})

const router = useRouter()

const isNumber = computed(() => typeof props.value === 'number')

const href = computed(() => {
  if (isString(props.to)) {
    return router?.resolve({ to: props.to })?.href
  }

  if (isObject(props.to)) {
    return router?.resolve(props.to)?.href
  }

  return null
})

const tag = computed(() => {
  return href.value ? 'a' : 'div'
})

const classList = computed(() => {
  return {
    'widget-barometer--no-border': !props.borderVariant,
    'widget-barometer--clickable': props.to || props.clickable
  }
})
</script>

<style lang="scss" scoped>
.widget-barometer {
  height: 100%;

  &[href]:hover,
  &.widget-barometer--clickable:hover {
    cursor: pointer;
    border-color: $input-hover-border-color !important;
  }

  &[href]:hover &__label,
  &.widget-barometer--clickable:hover &__label {
    color: var(--bs-body-color);
  }

  &__label {
    color: var(--bs-secondary-text-emphasis);
  }

  &--no-border {
    --bs-card-border-color: var(--bs-card-bg);
  }
}
</style>
