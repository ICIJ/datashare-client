<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'
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
    type: String
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
const { t } = useI18n()

const localStorageKey = `dismissed-alert-${props.name}`
const dismissed = ref(props.persist && localStorage.getItem(localStorageKey) === 'true')
const show = computed(() => dismissed.value === false)
const linkLabel = computed(() => {
  return props.linkLabel ?? t('dismissableAlert.dontShow')
})

const dismiss = (persist) => {
  dismissed.value = true
  // Ensure that the state is persisted in local storage
  if (persist && props.name) {
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
  <b-alert :variant="variant" :model-value="show" class="px-3 py-2 dismissable-alert" :class="classList">
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
          <slot name="button" v-bind="{ linkClassList, linkLabel, noButton, dismiss }">
            <button
              v-if="!noButton"
              class="btn text-nowrap dismissable-alert__body__button ms-md-3"
              type="button"
              :class="linkClassList"
              @click="dismiss(persist)"
            >
              {{ linkLabel }}
            </button>
          </slot>
        </div>
      </template>
      <template #close>
        <slot name="close">
          <button-icon
            v-if="!noClose"
            :class="closeClass"
            class="dismissable-alert__close p-2 align-self-md-center align-self-start"
            variant="link"
            :label="t('dismissableAlert.close')"
            hide-label
            hide-tooltip
            icon-left="x"
            @click="dismiss(false)"
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
