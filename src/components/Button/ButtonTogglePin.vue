<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhPushPin from '~icons/ph/push-pin'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'

const { t } = useI18n()

const active = defineModel('active', {
  type: Boolean,
  default: false
})

defineProps({
  icon: {
    type: [String, Object, Array],
    default: () => IPhPushPin
  }
})

const weight = computed(() => {
  return active.value ? 'fill' : 'regular'
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
    :icon-left-weight="weight"
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
