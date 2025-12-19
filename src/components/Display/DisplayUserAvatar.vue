<script setup>
import { computed, ref, toRef, watch } from 'vue'
import PhosphorIcon from '@/components/PhosphorIcon.vue'

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
  height: {
    type: String,
    default: '1.25em'
  },
  /**
   * Pipeline name to transform the avatar src
   */
  pipeline: {
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

const src = ref(null)
const alt = computed(() => `${props.value} avatar`)
const abbr = computed(() => props.value.slice(0, 2).toUpperCase())
const heightWithUnit = computed(() => (isNaN(props.height) ? props.height : `${props.height}px`))

const style = computed(() => {
  return {
    '--display-user-avatar-height': heightWithUnit.value
  }
})

const isSrcValid = computed(() => {
  try {
    return Boolean(new URL(src.value))
  }
  catch {
    return false
  }
})

const pipelinesStore = usePipelinesStore()

async function applyPipeline() {
  const pipeline = pipelinesStore.applyPipelineChainByCategory(props.pipeline)
  src.value = await pipeline(props.value)
}

watch(toRef(props, 'value'), applyPipeline, { immediate: true })
watch(pipelinesStore.registered, applyPipeline, { deep: true })
</script>

<template>
  <img
    v-if="isSrcValid"
    aria-label="avatar"
    class="display-user-avatar display-user-avatar--image rounded-circle bg-action-subtle"
    :style="style"
    :src="src"
    :alt="alt"
  >
  <span
    v-else
    aria-label="avatar-icon"
    class="display-user-avatar display-user-avatar--icon rounded-circle bg-action-subtle text-action-emphasis"
    :data-abbr="abbr"
    :style="style"
  >
    <phosphor-icon
      v-if="showPlaceholder"
      :name="PhUser"
      :size="heightWithUnit"
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
