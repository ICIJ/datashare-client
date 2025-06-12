<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'

const { t } = useI18n()

const active = defineModel('active', {
  type: Boolean,
  default: false
})

defineProps({
  icon: {
    type: [String, Object, Array],
    default: PhPushPin
  }
})

const weight = computed(() => {
  return active.value ? 'fill' : 'regular'
})

const label = computed(() => {
  return t(active.value ? 'buttonTogglePin.unpin' : 'buttonTogglePin.pin')
})

const variant = computed(() => {
  return active.value ? 'link' : 'outline-secondary'
})

const togglePin = () => {
  active.value = !active.value
}
</script>

<template>
  <button-row-action
    :icon-left="icon"
    :icon-left-weight="weight"
    :variant="variant"
    :label="label"
    @click="togglePin"
  />
</template>
