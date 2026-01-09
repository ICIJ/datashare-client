<script setup>
import { AppIcon } from '@icij/murmur-next'
import { basename } from 'path'
import { computed } from 'vue'
import get from 'lodash/get'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const filename = computed(() => get(props, 'item.args.batchDownload.filename', ''))
const text = computed(() => decodeURI(basename(filename.value)))
const href = computed(() => `/api/task/${props.item.id}/result`)
const exists = computed(() => get(props, 'item.result.value.uri', false))
const tag = computed(() => (exists.value ? 'a' : 'span'))
const attrs = computed(() => (exists.value ? { href: href.value, target: '_blank' } : {}))
const classList = computed(() => ({ 'router-link-batch-download--disabled': !exists.value }))
</script>

<template>
  <component
    :is="tag"
    v-bind="attrs"
    class="router-link-batch-download text-nowrap"
    :class="classList"
  >
    <app-icon><i-ph-download-simple /></app-icon>
    {{ text }}
  </component>
</template>

<style scoped lang="scss">
.router-link-batch-download {
  &--disabled {
    color: var(--bs-secondary-color);
  }
}
</style>
