<script setup>
import { computed, defineProps, ref, watch } from 'vue'

import ToastBody from '@/components/ToastBody'

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
    type: String
  },
  noIcon: {
    type: Boolean
  },
  noButton: {
    type: Boolean
  }
})

const localStorageKey = `dismissed-alert-${props.name}`
const dissmissed = ref(props.persist && localStorage.getItem(localStorageKey) === 'true')
const show = computed(() => dissmissed.value === false)
const dissmiss = () => (dissmissed.value = true)
// Ensure that the state is persisted in local storage
watch(dissmissed, (value) => props.persist && props.name && localStorage.setItem(localStorageKey, value))
</script>

<template>
  <b-alert :variant="variant" :model-value="show" class="ps-3 pe-0 py-1 dismissable-alert">
    <toast-body :toast-props="{ type: variant }" :icon="icon" :no-icon="noIcon" class="dismissable-alert__body">
      <slot></slot>
      <template #link="{ linkClassList }">
        <slot name="button" v-bind="{ linkClassList, linkLabel, noButton, dissmiss }">
          <button
            v-if="!noButton"
            class="btn text-nowrap dismissable-alert__body__link"
            type="button"
            :class="linkClassList"
            @click="dissmiss"
          >
            {{ linkLabel }}
          </button>
        </slot>
      </template>
    </toast-body>
  </b-alert>
</template>

<style lang="scss" scoped>
.dismissable-alert {
  &__body {
    &__link:deep(.btn) {
      background: #fff;
    }
  }
}
</style>
