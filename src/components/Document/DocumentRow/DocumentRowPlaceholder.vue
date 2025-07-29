<script setup>
import { random } from 'lodash'
import { computed } from 'vue'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'
import PageTableTr from '@/components/PageTable/PageTableTr'

const props = defineProps({
  properties: {
    type: Array,
    default: () => ['title', 'thumbnail', 'contentType']
  },
  repeat: {
    type: Number,
    default: 1
  }
})

const hasThumbnail = computed(() => props.properties?.includes('thumbnail'))
</script>

<template>
  <page-table-tr
    v-for="i in repeat"
    :key="i"
  >
    <td
      v-if="hasThumbnail"
      :style="{ width: '40px' }"
    >
      <app-placeholder
        width="32px"
        height="32px"
      />
    </td>
    <td
      v-for="j in properties.length - 1"
      :key="j"
    >
      <app-placeholder :width="random(60, 100)" />
    </td>
    <td class="text-end">
      <div class="d-inline-flex gap-3 py-2">
        <app-placeholder
          width="30px"
          height="30px"
          :repeat="4"
        />
      </div>
    </td>
  </page-table-tr>
</template>
