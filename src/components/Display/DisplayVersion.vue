<script setup>
import DisplayEmpty from '@/components/Display/DisplayEmpty'

defineOptions({ name: 'DisplayVersion' })

defineProps({
  value: {
    type: String,
    default: null
  }
})
</script>

<template>
  <display-empty
    :value="value"
    class="display-version"
    :class="{ 'font-monospace': value }"
  >
    <template #empty>
      <span class="display-version--empty">-</span>
    </template>
  </display-empty>
</template>
