<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

const { t } = useI18n()

const active = defineModel('active', {
  type: Boolean,
  default: false
})

defineProps({
  variant: {
    type: String,
    default: 'link'
  },
  icon: {
    type: String,
    default: 'push-pin'
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
</script>

<template>
  <button-icon
    class="button-toggle-pin"
    :icon-left="icon"
    :icon-left-weight="weight"
    :variant="variant"
    :label="label"
    @click="togglePin"
  />
</template>
