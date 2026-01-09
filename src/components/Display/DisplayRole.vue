<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { camelCase, upperFirst } from 'lodash'
defineProps({
  value: {
    type: String
  },
  noIcon: {
    type: Boolean,
    default: false
  }
})

</script>

<template>
  <span class="d-inline-flex py-2 gap-1">
    <phosphor-icon
      v-if="!noIcon"
      :name="PhUserSquare"
    />{{ upperFirst(camelCase(value)) }}</span>
</template>
