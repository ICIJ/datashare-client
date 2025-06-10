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
  withLabel: {
    type: Boolean,
    default: false
  },
  withClick: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['error'])
const isFailed = computed(() => [TASK_STATUS.FAILURE, TASK_STATUS.ERROR].includes(props.status.toLowerCase()))
const tag = computed(() => (isFailed.value && props.withClick ? BButton : 'span'))
const onClick = () => isFailed.value && props.withClick && emit('error')
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
