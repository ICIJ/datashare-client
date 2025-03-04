<script setup>
import { PhCaretDown, PhCaretUp } from '@phosphor-icons/vue'

import ButtonIcon from '@/components/Button/ButtonIcon'
const showDetails = defineModel({ type: Boolean, default: false })
</script>

<template>
  <button-icon
    :icon-left="showDetails ? PhCaretUp : PhCaretDown"
    icon-left-hover-weight="bold"
    hide-label
    square
    size="sm"
    variant="outline-secondary"
    label="Toggle details"
    class="border-0"
    @click="showDetails = !showDetails"
  />
</template>

<style scoped lang="scss"></style>
