<script setup>
import { noop } from 'lodash'
import { ButtonIcon } from '@icij/murmur-next'

defineProps({
  hide: {
    type: Function,
    default: noop
  }
})
</script>

<template>
  <button-icon
    icon-left="x"
    icon-left-size="1.5em"
    variant="outline-secondary"
    square
    hide-label
    hide-tooltip
    class="page-settings-hide border-0"
    @click="hide"
  />
</template>
