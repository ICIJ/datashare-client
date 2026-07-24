<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhPushPin from '~icons/ph/push-pin'
import IPhPushPinFill from '~icons/ph/push-pin-fill'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'

const { t } = useI18n()

const active = defineModel('active', {
  type: Boolean,
  default: false
})

const icon = computed(() => {
  return active.value ? IPhPushPinFill : IPhPushPin
})

const label = computed(() => {
  return t(active.value ? 'buttonTogglePin.unpin' : 'buttonTogglePin.pin')
})

const togglePin = () => {
  active.value = !active.value
}

const classList = computed(() => {
  return {
    'button-toggle-pin--active': active.value
  }
})
</script>

<template>
  <button-row-action
    class="button-toggle-pin"
    :hide-tooltip="false"
    :class="classList"
    :icon-left="icon"
    :label="label"
    @click="togglePin"
  />
</template>

<style lang="scss" scoped>
.button-toggle-pin {
  &--active {
    color: var(--bs-link-color);
  }
}
</style>
