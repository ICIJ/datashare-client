<script setup>
import { computed, useSlots } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import ButtonIcon from '@/components/Button/ButtonIcon'

const VARIANTS = {
  default: 'action',
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
    type: [String, Object]
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
    type: [String, Object, Array],
    default: null
  },
  noIcon: {
    type: Boolean
  },
  noClose: {
    type: Boolean
  },
  iconClass: {
    type: [String, Object, Array],
    default: ''
  },
  contentClass: {
    type: [String, Object, Array],
    default: ''
  },
  closeClass: {
    type: [String, Object, Array],
    default: ''
  }
})

const slots = useSlots()

const classList = computed(() => {
  return {
    'toast-body--close-on-click': props.toastProps?.closeOnClick
  }
})

const variant = computed(() => VARIANTS[props.toastProps?.type ?? 'default'] ?? props.toastProps?.type)
const icon = computed(() => props.icon ?? ICONS[props.toastProps?.type ?? 'default'] ?? 'info')
const hasLink = computed(() => !!props.href || !!slots.link)
const linkLabelDisplay = computed(() => props.linkLabel ?? 'See more')
const linkClassList = computed(() => [`btn-outline-${variant.value}`])
</script>

<template>
  <div class="toast-body d-flex align-items-center" :class="classList">
    <div v-if="!noIcon" class="toast-body__icon py-1 d-none d-md-block" :class="iconClass">
      <phosphor-icon :name="icon" :variant="variant" weight="bold" />
    </div>
    <div class="flex-grow-1 d-flex align-items-center">
      <div class="toast-body__content" :class="contentClass">
        <h5 v-if="title" class="toast-body__content__title">{{ title }}</h5>
        <p class="toast-body__content__body mb-0 d-inline">
          <slot v-bind="{ closeToast, linkClassList, linkLabelDisplay }">{{ body }}</slot>
        </p>
      </div>
      <span v-if="hasLink" class="toast-body__link ms-3">
        <slot name="link" v-bind="{ closeToast, linkClassList, linkLabelDisplay }">
          <a :href="href" class="btn text-nowrap" :class="linkClassList" @click.passive="closeToast">
            {{ linkLabelDisplay }}
          </a>
        </slot>
      </span>
    </div>
    <slot name="close">
      <button-icon
        v-if="!noClose"
        class="toast-body__close py-1"
        :class="closeClass"
        variant="link"
        label="Close"
        hide-label
        icon-left="x"
        @click="closeToast"
      />
    </slot>
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

  &__content {
    color: var(--bs-body-color);
  }

  &__link .btn:not(:hover) {
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
  }

  &__icon,
  &__link {
    padding-right: $spacer;
  }
}
</style>
