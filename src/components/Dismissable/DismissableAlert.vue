<script setup>
import { computed, ref } from 'vue'

import IconButton from '@/components/IconButton'
import ToastBody from '@/components/Dismissable/DismissableToastBody'

const props = defineProps({
  name: {
    type: String
  },
  persist: {
    type: Boolean
  },
  variant: {
    type: String,
    required: false,
    default: 'warning'
  },
  linkLabel: {
    type: String,
    required: false,
    default: "Don't show this again"
  },
  icon: {
    type: String,
    default: null
  },
  noIcon: {
    type: Boolean
  },
  noButton: {
    type: Boolean
  },
  noClose: {
    type: Boolean
  },
  bordered: {
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

const localStorageKey = `dismissed-alert-${props.name}`
const dissmissed = ref(props.persist && localStorage.getItem(localStorageKey) === 'true')
const show = computed(() => dissmissed.value === false)
const dissmiss = (persit) => {
  dissmissed.value = true
  // Ensure that the state is persisted in local storage
  if (persit && props.name) {
    localStorage.setItem(localStorageKey, true)
  }
}

const classList = {
  [`dismissable-alert--${props.variant}`]: !!props.variant,
  'dismissable-alert--no-button': props.noButton,
  'dismissable-alert--no-close': props.noClose,
  'dismissable-alert--bordered': props.bordered
}
</script>

<template>
  <b-alert :variant="variant" :model-value="show" class="ps-3 pe-0 py-2 dismissable-alert" :class="classList">
    <toast-body
      :toast-props="{ type: variant }"
      :icon="icon"
      :no-icon="noIcon"
      :no-close="noClose"
      :icon-class="iconClass"
      :content-class="contentClass"
      class="dismissable-alert__body"
    >
      <template #default="{ linkClassList }">
        <div class="d-md-flex align-items-center pb-2 pb-md-0 me-3">
          <p class="m-md-0"><slot /></p>
          <slot name="button" v-bind="{ linkClassList, linkLabel, noButton, dissmiss }">
            <button
              v-if="!noButton"
              class="btn text-nowrap dismissable-alert__body__button ms-md-3"
              type="button"
              :class="linkClassList"
              @click="dissmiss(persit)"
            >
              {{ linkLabel }}
            </button>
          </slot>
        </div>
      </template>
      <template #close>
        <slot name="close">
          <icon-button
            v-if="!noClose"
            :class="closeClass"
            class="dismissable-alert__close p-2 align-self-md-center align-self-start"
            variant="link"
            label="Close"
            hide-label
            icon-left="x"
            @click="dissmiss(false)"
          />
        </slot>
      </template>
    </toast-body>
  </b-alert>
</template>

<style lang="scss">
.dismissable-alert {
  border: 0 solid var(--bs-alert-border-color);

  @each $state in map-keys($theme-colors) {
    &--#{$state} {
      --bs-alert-color: var(--bs-body-color);
      --bs-alert-border-color: var(--bs-#{$state});
    }
  }

  &--bordered {
    border: 1px solid var(--bs-alert-border-color);
  }

  &__body {
    &__button {
      background: var(--bs-body-bg);
      color: var(--bs-body-color);
    }
  }

  &:not(&--no-close):deep(.toast-body__link) {
    padding-right: 0;
  }

  &__close {
    color: var(--bs-body-color);
  }
}
</style>
