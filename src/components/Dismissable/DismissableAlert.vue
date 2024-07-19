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
  'dismissable-alert--no-button': props.noButton,
  'dismissable-alert--no-close': props.noClose
}
</script>

<template>
  <b-alert :variant="variant" :model-value="show" class="ps-3 pe-0 py-1 dismissable-alert" :class="classList">
    <toast-body :toast-props="{ type: variant }" :icon="icon" :no-icon="noIcon" class="dismissable-alert__body">
      <template #default="{ linkClassList }">
        <div class="d-md-flex align-items-center pb-2 pb-md-0">
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
            class="dismissable-alert__close align-self-md-center align-self-start"
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

<style lang="scss" scoped>
.dismissable-alert {
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
