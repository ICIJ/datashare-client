<template>
  <div class="document-thumbnail" :class="{ 'document-thumbnail--loaded': loaded, 'document-thumbnail--erroed': erroed, 'document-thumbnail--crop': crop, [`document-thumbnail--${size}`]: true }">
    <img v-if="isActivated" :src="thumbnailSrc" :alt="thumbnailAlt" class="document-thumbnail__image" />
    <span class="document-thumbnail__placeholder" v-if="!loaded">
      <fa :icon="document.contentTypeIcon" />
    </span>
  </div>
</template>

<script>
import { getCookie } from 'tiny-cookie'
import kebabCase from 'lodash/kebabCase'
import startCase from 'lodash/startCase'

export default {
  name: 'DocumentThumbnail',
  props: {
    document: Object,
    page: {
      type: Number,
      default: 0
    },
    size: {
      type: [Number, String],
      default: 'sm'
    },
    crop: Boolean,
    lazy: Boolean
  },
  data () {
    return {
      loaded: false,
      erroed: false,
      thumbnailSrc: null,
      observer: null
    }
  },
  computed: {
    thumbnailUrl () {
      return `${this.$config.get('previewHost')}/api/v1/thumbnail/${this.document.index}/${this.document.id}?routing=${this.document.routing}&page=${this.page}&size=${this.size}`
    },
    thumbnailAlt () {
      return `${this.document.basename} preview`
    },
    filePath () {
      return escape(this.document.path)
    },
    isActivated () {
      return !!this.$config.get('previewHost')
    },
    lazyLoadable () {
      return window && 'IntersectionObserver' in window
    },
    sessionIdHeaderValue () {
      return getCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    },
    sessionIdHeaderName () {
      let dsCookieName = kebabCase(process.env.VUE_APP_DS_COOKIE_NAME)
      dsCookieName = dsCookieName.split('-').map(startCase).join('-')
      return `X-${dsCookieName}`
    }
  },
  methods: {
    arrayBufferToBase64 (buffer) {
      let binary = ''
      const bytes = [].slice.call(new Uint8Array(buffer))
      bytes.forEach(b => { binary += String.fromCharCode(b) })
      // Create a base64 string from a string
      return btoa(binary)
    },
    async fetch () {
      const request = new Request(this.thumbnailUrl)
      const response = await fetch(request, {
        method: 'GET',
        cache: 'default',
        headers: {
          [this.sessionIdHeaderName]: this.sessionIdHeaderValue
        }
      })
      if (!response.ok) throw Error('Unable to fetch the thumbnail')
      const buffer = await response.arrayBuffer()
      const base64Flag = 'data:image/jpeg;base64,'
      const imageStr = this.arrayBufferToBase64(buffer)
      return base64Flag + imageStr
    },
    async fetchAndLoad () {
      try {
        this.thumbnailSrc = await this.fetch()
        this.$set(this, 'loaded', true)
      } catch (_) {
        this.$set(this, 'erroed', true)
      }
    },
    bindObserver () {
      this.observer = new IntersectionObserver(async entries => {
        if (entries[0].isIntersecting) {
          this.observer.disconnect()
          await this.fetchAndLoad()
        }
      })
      // Observe the component element
      this.observer.observe(this.$el)
    }
  },
  async mounted () {
    // This component can be deactivated globally
    if (!this.isActivated) return
    // This component can be lazy loaded
    if (this.lazy && this.lazyLoadable) return this.bindObserver()
    // Fetch directly
    await this.fetchAndLoad()
  }
}
</script>

<style lang="scss">
  .document-thumbnail {
    min-width: 80px;
    min-height: 3rem;
    position: relative;
    overflow: hidden;
    background: $body-bg;
    color: mix($body-bg, $text-muted, 70%);

    &--xs { font-size: 2rem; }
    &--sm { font-size: 3rem; }
    &--md { font-size: 4rem; }
    &--lg { font-size: 5rem; }
    &--xl { font-size: 6rem; }

    &--crop {
      width: 80px;
      height: 80px;
    }

    &--loaded:not(&--erroed) &__image {
      opacity: 1;
    }

    &__image {
      transition: opacity 300ms;
      opacity: 0;
    }

    &--crop &__image {
      position: absolute;
      min-height: 100%;
      min-width: 100%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &__placeholder {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
</style>
