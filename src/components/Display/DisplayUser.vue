<script>
import { mapState } from 'pinia'
import { PhosphorIcon } from '@icij/murmur-next'

import AppWait from '@/components/AppWait/AppWait'
import DisplayUserAvatar from '@/components/Display/DisplayUserAvatar'
import { useWait } from '@/composables/useWait'
import { usePipelinesStore } from '@/store/modules/pipelines'

/**
 * A component to display usernames.
 */
export default {
  name: 'DisplayUser',
  components: {
    AppWait,
    DisplayUserAvatar,
    PhosphorIcon
  },
  props: {
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
     * Fallback of the user link
     */
    linkFallback: {
      type: String,
      default: null
    },
    /**
     * Pipeline name to transform the user link
     */
    linkPipeline: {
      type: String,
      default: 'user-display-link'
    },
    /**
     * Hide the avatar
     */
    hideAvatar: {
      type: Boolean
    },
    /**
     * Hide the user link
     */
    hideLink: {
      type: Boolean
    },
    /**
     * Root tag to use for this component
     */
    tag: {
      type: [String, Object],
      default: 'span'
    },
    /**
     * Username to display
     */
    value: {
      type: String
    },
    /**
     * Pipeline name to transform the username
     */
    usernamePipeline: {
      type: String,
      default: 'user-display-username'
    },
    /**
     * Move the avatar after the username
     */
    flip: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return { wait: useWait() }
  },
  data() {
    return {
      transformedAvatar: null,
      transformedLink: null,
      transformedUsername: null
    }
  },
  computed: {
    ...mapState(usePipelinesStore, {
      registeredPipelines: 'registered',
      applyPipelineChain: 'applyPipelineChainByCategory'
    }),
    avatarAlt() {
      return `${this.value} avatar`
    },
    avatarSrc() {
      return this.transformedAvatar
    },
    isAvatarSrcValid() {
      try {
        return Boolean(new URL(this.avatarSrc))
      } catch (_) {
        return false
      }
    },
    userDisplayStyle() {
      return {
        '--avatar-height': this.avatarHeight
      }
    },
    userDisplayClass() {
      return {
        'display-user--flip': this.flip
      }
    },
    usernameTag() {
      return !this.hideLink && this.transformedLink !== null ? 'a' : 'span'
    },
    showAvatar() {
      return !this.hideAvatar && this.avatarSrc
    },
    loader() {
      return `load-username-${this.value}`
    }
  },
  watch: {
    value() {
      return this.applyPipelines()
    },
    registeredPipelines: {
      deep: true,
      handler() {
        return this.applyPipelines()
      }
    }
  },
  created() {
    return this.applyPipelinesWithLoader()
  },
  methods: {
    async applyPipelinesWithLoader() {
      this.wait.start(this.loader)
      await this.applyPipelines()
      this.wait.end(this.loader)
    },
    async applyPipelines() {
      this.transformedAvatar = await this.applyAvatarPipeline()
      this.transformedLink = await this.applyLinkPipeline()
      this.transformedUsername = await this.applyUsernamePipeline()
    },
    applyAvatarPipeline() {
      return this.applyPipelineChain(this.avatarPipeline)(this.value)
    },
    applyUsernamePipeline() {
      return this.applyPipelineChain(this.usernamePipeline)(this.value, this.$core?.auth)
    },
    applyLinkPipeline() {
      return this.applyPipelineChain(this.linkPipeline)(this.linkFallback, this.value)
    }
  }
}
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
      :value="value"
      :avatar-height="avatarHeight"
      :avatar-pipeline="avatarPipeline"
      class="display-user__avatar"
    />
    <component
      :is="usernameTag"
      :href="transformedLink"
      class="display-user__username"
      :class="{ 'display-user__username--loading': wait.waiting(loader) }"
      aria-label="username"
    >
      <app-wait :for="loader" class="d-inline">
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
