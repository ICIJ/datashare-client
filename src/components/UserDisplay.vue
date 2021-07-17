<script>
import { icon as faIcon } from '@fortawesome/fontawesome-svg-core'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons/faUserCircle'
import { mapGetters } from 'vuex'

export default {
  name: 'UserDisplay',
  props: {
    username: {
      type: String
    },
    tag: {
      type: [String, Object],
      default: 'span'
    },
    hideAvatar: {
      type: Boolean
    },
    avatarPipeline: {
      type: String,
      default: 'user-display-avatar'
    },
    usernamePipeline: {
      type: String,
      default: 'user-display-username'
    },
    fallbackAvatarColor: {
      type: String,
      default: '#aaa'
    }
  },
  data () {
    return {
      transformedUsername: this.username,
      transformedAvatar: null
    }
  },
  created () {
    this.$store.subscribe(({ type }) => {
      if (type.startsWith('pipelines/')) {
        return this.applyPipelines()
      }
    })
    return this.applyPipelines()
  },
  watch: {
    username () {
      return this.applyPipelines()
    }
  },
  computed: {
    ...mapGetters('pipelines', {
      applyPipelineChain: 'applyPipelineChainByCategory'
    }),
    avatarAlt () {
      return `${this.username} avatar`
    },
    avatarSrc () {
      return this.transformedAvatar
    },
    avatarFallback () {
      const icon = faIcon(faUserCircle)
      const svg = icon.html[0].split('currentColor').join(this.fallbackAvatarColor)
      const base64 = window.btoa(svg)
      return `data:image/svg+xml;base64,${base64}`
    },
    showAvatar () {
      return !this.hideAvatar && this.avatarSrc
    }
  },
  methods: {
    async applyPipelines () {
      this.transformedAvatar = await this.applyAvatarPipeline()
      this.transformedUsername = await this.applyUsernamePipeline()
    },
    applyAvatarPipeline () {
      return this.applyPipelineChain(this.avatarPipeline)(this.avatarFallback, this.username)
    },
    applyUsernamePipeline () {
      return this.applyPipelineChain(this.usernamePipeline)(this.username)
    }
  }
}
</script>

<template>
  <component :is="tag" class="user-display d-inline-flex align-items-center">
    <template v-if="showAvatar">
      <img class="user-display__avatar mr-1 rounded-circle" :src="avatarSrc" :alt="avatarAlt"/>
    </template>
    <span class="user-display__username">
      {{ transformedUsername }}
    </span>
  </component>
</template>

<style lang="scss">
  .user-display {
    line-height: 1;

    &__avatar {
      height: 1em;
    }

  }
</style>
