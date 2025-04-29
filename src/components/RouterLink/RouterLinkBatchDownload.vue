<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { basename } from 'path'
import { computed } from 'vue'
import get from 'lodash/get'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

function getRecord(key, defaultValue = undefined) {
  return get(props.item, `args.batchDownload.${key}`, defaultValue)
}

const text = computed(() => {
  return decodeURI(basename(getRecord('filename')))
})

const href = computed(() => {
  return `/api/task/${props.item.id}/result`
})

const exists = computed(() => {
  return getRecord('exists', false)
})

const tag = computed(() => {
  return exists.value ? 'a' : 'span'
})

const icon = computed(() => {
  return exists.value ? 'download-simple' : 'x'
})
</script>

<template>
  <component :is="tag" :href="href" target="_blank" class="text-nowrap">
    <phosphor-icon :name="icon" />
    {{ text }}
  </component>
</template>

<style scoped lang="scss"></style>
