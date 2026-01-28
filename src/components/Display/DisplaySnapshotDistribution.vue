<script setup>
import { computed } from 'vue'

import DisplayEsDistribution from '@/components/Display/DisplayEsDistribution'
import { parseSnapshotName } from '@/composables/useSnapshots'

defineOptions({ name: 'DisplaySnapshotDistribution' })

const props = defineProps({
  value: {
    type: String,
    required: true
  }
})

const distribution = computed(() => parseSnapshotName(props.value).distribution)
</script>

<template>
  <display-es-distribution
    class="display-snapshot-distribution"
    :value="distribution"
  />
</template>
