<script setup>
import { computed } from 'vue'

import { parseSnapshotName } from '@/composables/useSnapshots'

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
  <span class="display-snapshot-name font-monospace">
    {{ name }}
  </span>
</template>
