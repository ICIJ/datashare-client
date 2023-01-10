<script>
import { icon as faIcon } from '@fortawesome/fontawesome-svg-core'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons/faUserCircle'
import { mapGetters } from 'vuex'

/**
 * A component to display usernames.
 */
export default {
  name: 'UserDisplay',
  props: {
    /**
     * Default height of the avatar
     */
    avatarHeight: {
      type: String,
      default: '1.75em'
    },
    /**
     * Pipeline name to transform the avatar src
     */
    avatarPipeline: {
      type: String,
      default: 'user-display-avatar'
    },
    /**
     * Color of the fallback avatar
     */
    fallbackAvatarColor: {
      type: String,
      default: '#aaa'
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
    username: {
      type: String
    },
    /**
     * Pipeline name to transform the username
     */
    usernamePipeline: {
      type: String,
      default: 'user-display-username'
    }
  },
  data() {
    return {
      transformedAvatar: null,
      transformedLink: null,
      transformedUsername: null
    }
  },
  computed: {
    ...mapGetters('pipelines', {
      applyPipelineChain: 'applyPipelineChainByCategory'
    }),
    avatarAlt() {
      return `${this.username} avatar`
    },
    avatarSrc() {
      return this.transformedAvatar
    },
    avatarFallback() {
      const icon = faIcon(faUserCircle)
      const svg = icon.html[0].split('currentColor').join(this.fallbackAvatarColor)
      const base64 = window.btoa(svg)
      return `data:image/svg+xml;base64,${base64}`
    },
    userDisplayStyle() {
      return {
        '--avatar-height': this.avatarHeight
      }
    },
    usernameTag() {
      return !this.hideLink && this.transformedLink !== null ? 'a' : 'span'
    },
    showAvatar() {
      return !this.hideAvatar && this.avatarSrc
    },
    loader() {
      return `load-username-${this.username}`
    }
  },
  watch: {
    username() {
      return this.applyPipelines()
    }
  },
  created() {
    this.$store.subscribe(({ type }) => {
      if (type.startsWith('pipelines/')) {
        return this.applyPipelines()
      }
    })
    return this.applyPipelinesWithLoader()
  },
  methods: {
    async applyPipelinesWithLoader() {
      this.$wait.start(this.loader)
      await this.applyPipelines()
      this.$wait.end(this.loader)
    },
    async applyPipelines() {
      this.transformedAvatar = await this.applyAvatarPipeline()
      this.transformedLink = await this.applyLinkPipeline()
      this.transformedUsername = await this.applyUsernamePipeline()
    },
    applyAvatarPipeline() {
      return this.applyPipelineChain(this.avatarPipeline)(this.avatarFallback, this.username)
    },
    applyUsernamePipeline() {
      return this.applyPipelineChain(this.usernamePipeline)(this.username, this.$core.auth)
    },
    applyLinkPipeline() {
      return this.applyPipelineChain(this.linkPipeline)(this.linkFallback, this.username)
    }
  }
}
</script>

<template>
  <component :is="tag" class="user-display d-inline-flex align-items-center" :style="userDisplayStyle">
    <template v-if="showAvatar">
      <img class="user-display__avatar mr-2 rounded-circle" :src="avatarSrc" :alt="avatarAlt" />
    </template>
    <component
      :is="usernameTag"
      :href="transformedLink"
      class="user-display__username"
      :class="{ 'user-display__username--loading': $wait.is(loader) }"
    >
      <v-wait :for="loader" class="d-inline">
        <template #waiting>
          {{ username }}
        </template>
        <template #default>
          {{ transformedUsername }}
        </template>
      </v-wait>
    </component>
  </component>
</template>

<style lang="scss">
.user-display {
  --avatar-height: 1.75em;

  &__avatar {
    height: var(--avatar-height);
  }
}
</style>
