<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'
import DisplayDatetime from '@/components/Display/DisplayDatetime'

const active = defineModel('active', { type: Boolean })

defineProps({
  date: {
    type: [String, Number, Date],
    required: true
  }
})

const toggle = () => {
  active.value = !active.value
}

const icon = computed(() => {
  return active.value ? PhCaretUp : PhCaretDown
})
</script>

<template>
  <button-icon variant="light" class="py-2" :icon-right="icon" @click="toggle">
    <display-datetime :value="date" no-tooltip />
  </button-icon>
</template>
