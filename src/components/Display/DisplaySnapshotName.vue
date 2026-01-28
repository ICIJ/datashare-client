<script setup>
import { computed } from 'vue'

import { parseSnapshotName } from '@/utils/esSnapshots'

defineOptions({ name: 'DisplaySnapshotName' })

const props = defineProps({
  value: {
    type: String,
    required: true
  }
})

const name = computed(() => parseSnapshotName(props.value).name)
</script>

<template>
  <span class="display-snapshot-name">
    {{ name }}
  </span>
</template>
