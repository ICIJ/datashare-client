<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import IPhX from '~icons/ph/x'
import { AppIcon } from '@icij/murmur-next'

import ToastBody from '@/components/Dismissable/DismissableToastBody'
import { BAlert } from 'bootstrap-vue-next'

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
  },
  preventClose: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['close'])

const { t } = useI18n()
const localStorageKey = `dismissed-alert-${props.name}`
const dismissed = ref(props.persist && localStorage.getItem(localStorageKey) === 'true')
const show = computed(() => dismissed.value === false)
const linkLabel = computed(() => {
  return props.linkLabel ?? t('dismissableAlert.dontShow')
})

function emitClose() {
  if (!props.preventClose) {
    dismiss(false)
  }
  emit('close')
}
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
  <b-alert
    :variant="variant"
    :model-value="show"
    :dismissible="!noClose"
    close-variant="link"
    class="px-3 py-2 dismissable-alert"
    :class="classList"
  >
    <toast-body
      :toast-props="{ type: variant }"
      :icon="icon"
      :no-icon="noIcon"
      no-close
      :icon-class="iconClass"
      :content-class="contentClass"
      class="dismissable-alert__body"
    >
      <template #icon="iconProps">
        <slot
          name="icon"
          v-bind="iconProps"
        />
      </template>
      <template #default="{ linkClassList }">
        <div
          class="dismissable-alert__body__default align-items-center "
          :class="{'d-flex' :!noButton}"
        >
          <p class="dismissable-alert__body__default__content m-md-0">
            <slot />
          </p>
          <slot
            name="button"
            v-bind="{ linkClassList, linkLabel, noButton, dismiss }"
          >
            <button
              v-if="!noButton"
              class="btn text-nowrap dismissable-alert__body__default__button ms-3"
              type="button"
              :class="linkClassList"
              @click="dismiss(persist)"
            >
              {{ linkLabel }}
            </button>
          </slot>
        </div>
      </template>
    </toast-body>
    <template
      v-if="!noClose"
      #close
    >
      <slot name="close">
        <app-icon
          :name="IPhX"
          :title="t('dismissableAlert.close')"
          @click.stop="emitClose"
        />
      </slot>
    </template>
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
    &__default {
      &__button {
        background: var(--bs-body-bg);
        color: var(--bs-body-color);
      }
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
