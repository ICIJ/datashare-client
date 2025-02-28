<script setup>
import { computed } from 'vue'
import get from 'lodash/get'
const props = defineProps({
  item: { type: Object, required: true }
})
function getRecord(key, defaultValue = undefined) {
  return get(props.item, `args.batchRecord.${key}`, defaultValue)
}
const to = computed(() => {
  return {
    name: 'task.batch-search.view',
    params: { uuid: getRecord('uuid'), indices: getRecord('projects').join(',') }
  }
})
</script>

<template>
  <router-link :to="to"> {{ getRecord('name') }}</router-link>
</template>
