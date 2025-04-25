<script setup>
import { computed } from 'vue'
import { BButton } from 'bootstrap-vue-next'

import { TASK_STATUS, taskStatusValidator } from '@/enums/taskStatus.js'
import DisplayStatus from '@/components/Display/DisplayStatus.vue'
import DisplayStatusLabel from '@/components/Display/DisplayStatusLabel'

const props = defineProps({
  status: {
    type: String,
    validator: taskStatusValidator
  },
  errorMessage: {
    type: String,
    required: false
  },
  errorQuery: {
    type: String,
    required: false
  },
  withLabel: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['error'])
const isFailed = computed(() => props.status === TASK_STATUS.FAILURE)
const tag = computed(() => {
  return isFailed.value ? BButton : 'span'
})
const onClick = () => {
  if (isFailed.value) {
    console.log('hello')
    emit('error', {
      errorMessage: `SearchException: query='caroline;^' message='org.icij.datashare.batch.SearchException: org.icij.datashare.tasks.ElasticSearchAdapterException: Failed to parse query [caroline;^]'`,
      errorQuery: 'caroline;^'
    })
    // emit('error', { errorMessage: props.errorMessage, errorQuery: props.errorQuery })
  }
}
</script>

<template>
  <component
    :is="tag"
    :attrs="$attrs"
    class="d-inline-flex gap-2 align-items-center p-0"
    variant="link"
    size="md"
    @click="onClick"
  >
    <display-status class="border-0" :value="status" :no-tooltip="withLabel" />
    <display-status-label v-if="withLabel" :value="status" />
  </component>
</template>

<style scoped lang="scss"></style>
