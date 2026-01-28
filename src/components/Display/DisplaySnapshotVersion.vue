<script setup>
import { computed } from 'vue'

import DisplayVersion from '@/components/Display/DisplayVersion'
import { parseSnapshotName } from '@/utils/esSnapshots'

defineOptions({ name: 'DisplaySnapshotVersion' })

const props = defineProps({
  value: {
    type: String,
    required: true
  }
})

const version = computed(() => parseSnapshotName(props.value).version)
</script>

<template>
  <display-version
    class="display-snapshot-version"
    :value="version"
  />
</template>
