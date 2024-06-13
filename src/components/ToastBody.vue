<script setup>
import { computed } from 'vue'

const VARIANTS = {
  default: 'primary',
  error: 'danger'
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
    type: String,
    required: true
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
  }
})

const classList = computed(() => {
  return {
    'toast-body--close-on-click': props.toastProps?.closeOnClick
  }
})

const variant = computed(() => VARIANTS[props.toastProps.type ?? 'default'] ?? props.toastProps.type)
const hasLink = computed(() => !!props.href)
const linkLabelDisplay = computed(() => props.linkLabel ?? 'See more')
const linkClassList = computed(() => [`btn-outline-${variant.value}`])
</script>

<template>
  <div class="toast-body d-flex align-items-center" :class="classList">
    <div class="toast-body__content flex-grow-1">
      <h5 v-if="title" class="toast-body__content__title">{{ title }}</h5>
      <p class="toast-body__content__body m-0">{{ body }}</p>
    </div>
    <div v-if="hasLink" class="toast-body__link pe-3">
      <a :href="href" class="btn btn-sm text-nowrap" :class="linkClassList" @click.passive="closeToast">
        {{ linkLabelDisplay }}
      </a>
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

  &__link .btn:not(:hover) {
    background: #fff;
  }
}
</style>
