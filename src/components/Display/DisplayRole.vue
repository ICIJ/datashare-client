<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { camelCase, upperFirst } from 'lodash'
defineProps({
  value: {
    type: String
  },
  noIcon: {
    type: Boolean,
    default: true
  }
})

</script>

<template>
  <span>
    <phosphor-icon
      v-if="!noIcon"
      :name="PhUserSquare"
      class="me-1 my-2"
    />{{ upperFirst(camelCase(value)) }}</span>
</template>
