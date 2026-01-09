<script setup>
import { computed } from 'vue'
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
  'file': IPhFile,
  'files-fill': IPhFilesFill,
  'image-fill': IPhImageFill,
  'play-fill': IPhPlayFill,
  'headphones-fill': IPhHeadphonesFill,
  'text-align-left': IPhTextAlignLeft,
  'grid-four-fill': IPhGridFourFill,
  'at-fill': IPhAtFill,
  'archive-fill': IPhArchiveFill
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
const icon = computed(() => iconMap[display.value.icon] ?? IPhFile)
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
