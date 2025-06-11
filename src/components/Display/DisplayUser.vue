<script setup>
import { computed, onBeforeMount, toRef, ref, watch } from 'vue'

import AppWait from '@/components/AppWait/AppWait'
import DisplayUserAvatar from '@/components/Display/DisplayUserAvatar'
import { useCore } from '@/composables/useCore'
import { useWait } from '@/composables/useWait'
import { usePipelinesStore } from '@/store/modules/pipelines'

const props = defineProps({
  avatarHeight: {
    type: String,
    default: '1.25em'
  },
  avatarPipeline: {
    type: String,
    default: 'user-display-avatar'
  },
  linkFallback: {
    type: String,
    default: null
  },
  linkPipeline: {
    type: String,
    default: 'user-display-link'
  },
  hideAvatar: {
    type: Boolean
  },
  hideLink: {
    type: Boolean
  },
  tag: {
    type: [String, Object],
    default: 'span'
  },
  value: {
    type: String
  },
  usernamePipeline: {
    type: String,
    default: 'user-display-username'
  },
  flip: {
    type: Boolean,
    default: false
  }
})

const transformedAvatar = ref(null)
const transformedLink = ref(null)
const transformedUsername = ref(null)

const { waitFor, isLoading, loaderId } = useWait()
const { core } = useCore()
const pipelinesStore = usePipelinesStore()

const applyAvatarPipeline = () => {
  return pipelinesStore.applyPipelineChainByCategory(props.avatarPipeline)(props.value)
}

const applyUsernamePipeline = () => {
  return pipelinesStore.applyPipelineChainByCategory(props.usernamePipeline)(props.value, core.auth)
}

const applyLinkPipeline = () => {
  return pipelinesStore.applyPipelineChainByCategory(props.linkPipeline)(props.linkFallback, props.value)
}

const applyPipelines = async () => {
  transformedAvatar.value = await applyAvatarPipeline()
  transformedLink.value = await applyLinkPipeline()
  transformedUsername.value = await applyUsernamePipeline()
}

const applyPipelinesWithLoader = waitFor(applyPipelines)

const avatarSrc = computed(() => transformedAvatar.value)
const userDisplayStyle = computed(() => ({ '--avatar-height': props.avatarHeight }))
const userDisplayClass = computed(() => ({ 'display-user--flip': props.flip }))
const usernameTag = computed(() => (!props.hideLink && transformedLink.value !== null ? 'a' : 'span'))
const showAvatar = computed(() => !props.hideAvatar && avatarSrc.value)

watch(pipelinesStore.registered, applyPipelines, { deep: true })
watch(toRef(props, 'value'), applyPipelines, { deep: true })

onBeforeMount(applyPipelinesWithLoader)
</script>

<template>
  <component
    :is="tag"
    class="display-user d-inline-flex align-items-center"
    :style="userDisplayStyle"
    :class="userDisplayClass"
  >
    <display-user-avatar
      v-if="showAvatar"
      show-placeholder
      :value="value"
      :height="avatarHeight"
      :pipeline="avatarPipeline"
      class="display-user__avatar"
    />
    <component
      :is="usernameTag"
      :href="transformedLink"
      class="display-user__username"
      :class="{ 'display-user__username--loading': isLoading }"
      aria-label="username"
    >
      <app-wait :for="loaderId" class="d-inline">
        <template #waiting>
          {{ value }}
        </template>
        <template #default>
          {{ transformedUsername }}
        </template>
      </app-wait>
    </component>
  </component>
</template>

<style lang="scss">
.display-user {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  &[href] {
    color: var(--bs-action-text-emphasis);
  }

  &--flip {
    flex-direction: row-reverse;
  }

  &__avatar {
    margin-right: $spacer-xxs;
  }

  &--flip &__avatar {
    margin-right: 0;
    margin-left: $spacer-xxs;
  }
}
</style>
