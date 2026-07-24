<script setup>
import isEmpty from 'lodash/isEmpty'
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
    :class="{ 'display-version--empty': isEmpty(value) }"
  >
    <template #empty>
      -
    </template>
  </display-empty>
</template>
