<template>
  <b-card
    class="video-viewer my-3 align-self-center w-100 m-3 overflow-hidden"
    :footer-bg-variant="cardVariant"
    :border-variant="cardVariant"
    no-body
  >
    <video controls :autoplay="autoplay" :loop="loop" class="video-viewer__player w-100">
      <source :src="document.inlineFullUrl" :type="document.contentType" />
    </video>
    <template #footer>
      <div class="d-lg-flex">
        <div switches class="my-auto d-flex">
          <b-form-checkbox v-model="autoplay" switch class="my-2 mr-3">
            {{ $t('document.player.autoplay') }}
          </b-form-checkbox>
          <b-form-checkbox v-model="loop" switch class="my-2 mr-3">
            {{ $t('document.player.loop') }}
          </b-form-checkbox>
        </div>
        <b-alert :show="cannotPlayVideoFormat" variant="warning" class="ml-auto mt-3 mb-0 my-lg-auto">
          <fa icon="warning" class="mr-2" />
          {{ $t('document.player.video.unknownFormat') }}
        </b-alert>
      </div>
    </template>
  </b-card>
</template>

<script>
/**
 * Display a preview video of the document.
 */
export default {
  name: 'VideoViewer',
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  computed: {
    cannotPlayVideoFormat() {
      return !this.canPlayVideoFormat
    },
    canPlayVideoFormat() {
      return document.createElement('video').canPlayType(this.document.contentType) !== ''
    },
    cardVariant() {
      return this.cannotPlayVideoFormat ? 'warning' : null
    },
    autoplay: {
      get() {
        return this.$store.state.player.autoplay
      },
      set(autoplay) {
        return this.$store.commit('player/autoplay', autoplay)
      }
    },
    loop: {
      get() {
        return this.$store.state.player.loop
      },
      set(loop) {
        return this.$store.commit('player/loop', loop)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.video-viewer {
  &__player {
    // Quick and dirty solution to ensure the video is not taking to much space
    max-height: calc(100vh - 300px);
  }
}
</style>
