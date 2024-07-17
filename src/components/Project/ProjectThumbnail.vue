<template>
  <span class="project-thumbnail" :style="style" :class="classList" :data-caption="caption">
    <span class="project-thumbnail__caption">{{ caption }}</span>
    <span v-if="checked" class="project-thumbnail__check">
      <phosphor-icon name="check-fat" fill />
    </span>
  </span>
</template>

<script setup>
import stringToColor from 'string-to-color'
import { compact } from 'lodash'
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import { getConsonants } from '@/utils/strings'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  width: {
    type: String,
    default: '100%'
  },
  checked: {
    type: Boolean,
    default: false
  },
  noCaption: {
    type: Boolean,
    default: false
  }
})

const captionBase = computed(() => {
  return (props.project.label || props.project.name || props.project || '').toLowerCase()
})

const abbr = computed(() => {
  const name = captionBase.value
  const start = name.slice(0, 1)
  const end = name.slice(-1)
  const middleConsonants = getConsonants(name.slice(1, -1))
  const middle = middleConsonants[Math.floor(middleConsonants.length / 2)]
  return compact([start, middle, end]).join('')
})

const caption = computed(() => {
  if (props.noCaption || hasBackgroundWithLogo.value) {
    return null
  }
  return abbr.value.length === 3 ? abbr.value : captionBase.value.slice(0, 3)
})

const hasBackgroundWithLogo = computed(() => {
  return !!props.project.logoUrl
})

const backgroundColor = computed(() => {
  return hasBackgroundWithLogo.value ? '#000' : stringToColor(captionBase.value)
})

const backgroundWithLogo = computed(() => {
  return `url("${props.project.logoUrl}") no-repeat center center #000`
})

const backgroundWithoutLogo = computed(() => {
  return backgroundColor.value
})

const background = computed(() => {
  return hasBackgroundWithLogo.value ? backgroundWithLogo.value : backgroundWithoutLogo.value
})

const isForegroundDark = computed(() => {
  const red = parseInt(background.value.substring(1, 3), 16)
  const green = parseInt(background.value.substring(3, 5), 16)
  const blue = parseInt(background.value.substring(5, 7), 16)
  const yiq = (red * 299 + green * 587 + blue * 114) / 1000
  return yiq >= 128
})

const color = computed(() => {
  if (props.checked) {
    return backgroundColor.value
  }
  return isForegroundDark.value ? '#000' : '#fff'
})

const style = computed(() => {
  return {
    background: background.value,
    backgroundSize: 'cover',
    color: color.value,
    width: props.width
  }
})

const classList = computed(() => {
  return {
    'project-thumbnail--colorized': !hasBackgroundWithLogo.value,
    'project-thumbnail--checked': props.checked,
    'project-thumbnail--dark-foreground': isForegroundDark.value
  }
})
</script>

<style scoped lang="scss">
.project-thumbnail {
  display: inline-flex;
  width: 100%;
  position: relative;
  container-type: inline-size;
  overflow: hidden;
  line-height: 0;

  &:before {
    content: '';
    display: inline-block;
    padding-top: 100%;
    margin: 0;
  }

  &--colorized {
    .project-thumbnail__caption {
      font-family: $font-family-monospace;
      position: absolute;
      top: 50%;
      left: 50%;
      text-align: center;
      transform: translate(-50%, -50%);
      text-transform: uppercase;
      font-weight: bolder;
      font-size: 40cqw;
      line-height: 1;
      white-space: nowrap;
    }
  }

  &__check {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40cqw;
    color: var(--bs-white);
    background: rgba(var(--bs-black-rgb), 0.4);
    backdrop-filter: blur(5px);
  }
}
</style>
