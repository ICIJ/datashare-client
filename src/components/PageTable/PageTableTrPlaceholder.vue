<script setup>
import { random } from 'lodash'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'
import PageTableTr from '@/components/PageTable/PageTableTr'

defineProps({
  properties: {
    type: Array,
    default: () => []
  },
  repeat: {
    type: Number,
    default: 1
  }
})
</script>

<template>
  <page-table-tr v-for="i in repeat" :key="i">
    <td v-for="p in properties" :key="p">
      <app-placeholder :width="random(80, 100)" />
    </td>
    <slot />
  </page-table-tr>
</template>
