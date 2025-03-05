<script setup>
import { PhCaretDown, PhCaretUp } from '@phosphor-icons/vue'

import ButtonRowAction from '@/components/Button/ButtonRowAction'
const showDetails = defineModel({ type: Boolean, default: false })
</script>

<template>
  <button-row-action
    :icon="showDetails ? PhCaretUp : PhCaretDown"
    label="Toggle details"
    @click="showDetails = !showDetails"
  />
</template>

<style scoped lang="scss"></style>
