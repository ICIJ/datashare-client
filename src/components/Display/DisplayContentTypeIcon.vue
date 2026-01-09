<script setup>
import { computed, markRaw } from 'vue'
import { AppIcon } from '@icij/murmur-next'

import IPhFile from '~icons/ph/file'
import IPhFilesFill from '~icons/ph/files-fill'
import IPhImageFill from '~icons/ph/image-fill'
import IPhPlayFill from '~icons/ph/play-fill'
import IPhHeadphonesFill from '~icons/ph/headphones-fill'
import IPhTextAlignLeft from '~icons/ph/text-align-left'
import IPhGridFourFill from '~icons/ph/grid-four-fill'
import IPhAtFill from '~icons/ph/at-fill'
import IPhArchiveFill from '~icons/ph/archive-fill'

import { useSchema } from '@/composables/useSchema'

const iconMap = {
  'file': markRaw(IPhFile),
  'files-fill': markRaw(IPhFilesFill),
  'image-fill': markRaw(IPhImageFill),
  'play-fill': markRaw(IPhPlayFill),
  'headphones-fill': markRaw(IPhHeadphonesFill),
  'text-align-left': markRaw(IPhTextAlignLeft),
  'grid-four-fill': markRaw(IPhGridFourFill),
  'at-fill': markRaw(IPhAtFill),
  'archive-fill': markRaw(IPhArchiveFill)
}

const props = defineProps({
  value: {
    type: String
  },
  colorize: {
    type: Boolean,
    default: false
  }
})

const { getContentTypeDisplay } = useSchema()

const display = computed(() => getContentTypeDisplay(props.value))
const icon = computed(() => iconMap[display.value.icon] ?? markRaw(IPhFile))
const style = computed(() => {
  const color = props.colorize ? display.value.foreground : 'inherit'
  return { color }
})
</script>

<template>
  <app-icon
    :name="icon"
    :style="style"
  />
</template>
