<script setup>
import { random } from 'lodash'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'
import PageTableTr from '@/components/PageTable/PageTableTr'

defineProps({
  properties: {
    type: Array,
    default: () => ['label', 'description', 'documentsCount', 'updateDate']
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
      <div class="d-flex gap-3 align-items-center">
        <template v-if="p === 'label'">
          <div class="flex-shrink-0">
            <app-placeholder width="50px" height="50px" variant="tertiary" />
          </div>
        </template>
        <app-placeholder :width="random(80, 100)" variant="tertiary" />
      </div>
    </td>
    <td>
      <app-placeholder width="115px" height="44px" variant="tertiary" />
    </td>
    <td class="text-end">
      <div class="d-inline-flex gap-3 py-2">
        <app-placeholder width="16px" height="16px" :repeat="3" variant="tertiary" />
      </div>
    </td>
  </page-table-tr>
</template>
