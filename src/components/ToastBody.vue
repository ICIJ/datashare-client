<script setup>
import { computed, useSlots } from 'vue'

import Icon from '@/components/Icon'

const VARIANTS = {
  default: 'primary',
  error: 'danger'
}

const ICONS = {
  default: 'info',
  success: 'check',
  danger: 'x',
  warning: 'warning'
}

const props = defineProps({
  toastProps: {
    type: Object,
    required: true
  },
  closeToast: {
    type: Function
  },
  body: {
    type: String
  },
  title: {
    type: String
  },
  href: {
    type: String
  },
  linkLabel: {
    type: String,
    default: null
  },
  icon: {
    type: String,
    default: null
  },
  noIcon: {
    type: Boolean
  }
})

const slots = useSlots()

const classList = computed(() => {
  return {
    'toast-body--close-on-click': props.toastProps?.closeOnClick
  }
})

const variant = computed(() => VARIANTS[props.toastProps?.type ?? 'default'] ?? props.toastProps?.type)
const icon = computed(() => ICONS[props.toastProps?.type ?? 'default'] ?? 'info')
const hasLink = computed(() => !!props.href || !!slots.link)
const linkLabelDisplay = computed(() => props.linkLabel ?? 'See more')
const linkClassList = computed(() => [`btn-outline-${variant.value}`])
</script>

<template>
  <div class="toast-body d-flex align-items-center" :class="classList">
    <div v-if="!noIcon" class="toast-body__icon pe-3">
      <Icon :icon="icon" :variant="variant" />
    </div>
    <div class="toast-body__content flex-grow-1">
      <h5 v-if="title" class="toast-body__content__title">{{ title }}</h5>
      <p class="toast-body__content__body m-0">
        <slot>{{ body }}</slot>
      </p>
    </div>
    <div v-if="hasLink" class="toast-body__link pe-3">
      <slot name="link" v-bind="{ closeToast, linkClassList, linkLabelDisplay }">
        <a :href="href" class="btn btn-sm text-nowrap" :class="linkClassList" @click.passive="closeToast">
          {{ linkLabelDisplay }}
        </a>
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.toast-body {
  &--close-on-click {
    cursor: pointer;

    &:hover:after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      background: #fff;
      opacity: 0.2;
    }
  }

  &__link .btn:not(:hover),
  &__link:deep(.btn:not(:hover)) {
    background: #fff;
  }
}
</style>
