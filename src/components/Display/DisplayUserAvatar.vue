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
  }
})

const avatarSrc = ref(null)
const avatarAlt = computed(() => `${props.value} avatar`)
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
    :height="avatarHeight"
    :src="avatarSrc"
    :alt="avatarAlt"
  />
  <phosphor-icon
    v-else
    aria-label="avatar-icon"
    class="display-user-avatar display-user-avatar--icon rounded-circle bg-action-subtle text-action-emphasis"
    name="user"
    weight="regular"
    :size="avatarHeight"
  />
</template>
