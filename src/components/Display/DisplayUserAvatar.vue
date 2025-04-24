<script setup>
import { computed, ref, toRef, watch } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import { usePipelinesStore } from '@/store/modules/pipelines'

const props = defineProps({
  /**
   * Username to build the avatar
   */
  value: {
    type: String
  },
  /**
   * Default height of the avatar
   */
  avatarHeight: {
    type: String,
    default: '1.25em'
  },
  /**
   * Pipeline name to transform the avatar src
   */
  avatarPipeline: {
    type: String,
    default: 'user-display-avatar'
  },
  /**
   * Show an icon placeholder instead of a text-based avatar
   */
  showPlaceholder: {
    type: Boolean,
    default: false
  }
})

const avatarSrc = ref(null)

const avatarAlt = computed(() => `${props.value} avatar`)

const avatarHeightWithUnit = computed(() => {
  const height = props.avatarHeight
  return isNaN(height) ? height : `${height}px`
})

const avatarStyle = computed(() => {
  return {
    '--display-user-avatar-height': avatarHeightWithUnit.value
  }
})

const isAvatarSrcValid = computed(() => {
  try {
    return Boolean(new URL(avatarSrc.value))
  } catch (_) {
    return false
  }
})

const pipelinesStore = usePipelinesStore()

async function applyPipeline() {
  const pipeline = pipelinesStore.applyPipelineChainByCategory(props.avatarPipeline)
  avatarSrc.value = await pipeline(props.value)
}

watch(toRef(props, 'value'), () => applyPipeline)
watch(toRef(pipelinesStore, 'registered'), () => applyPipeline, { deep: true })
</script>

<template>
  <img
    v-if="isAvatarSrcValid"
    aria-label="avatar"
    class="display-user-avatar display-user-avatar--image rounded-circle bg-action-subtle"
    :style="avatarStyle"
    :src="avatarSrc"
    :alt="avatarAlt"
  />
  <span
    v-else
    aria-label="avatar-icon"
    class="display-user-avatar display-user-avatar--icon rounded-circle bg-action-subtle text-action-emphasis"
    :data-abbr="value.slice(0, 2)"
    :style="avatarStyle"
  >
    <phosphor-icon
      v-if="showPlaceholder"
      :name="PhUser"
      :size="avatarHeightWithUnit"
      class="display-user-avatar__placeholder"
    />
  </span>
</template>

<style lang="scss" scoped>
.display-user-avatar {
  --display-user-avatar-height: 1.25em;

  display: inline-block;
  height: var(--display-user-avatar-height);
  width: var(--display-user-avatar-height);
  position: relative;
  overflow: hidden;

  &--icon:not(:has(&__placeholder)):before {
    content: attr(data-abbr);
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: var(--display-user-avatar-height);
    text-transform: uppercase;
    transform: translate(-50%, -50%) scale(0.5);
  }

  &__placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
  }
}
</style>
