<template>
  <b-card class="audio-viewer my-auto w-100 m-3" overflow-hidden :border-variant="cardVariant">
    <audio controls :autoplay="autoplay" :loop="loop" class="audio-viewer__player w-100 d-inline-block">
      <source :src="document.inlineFullUrl" :type="document.contentType" />
    </audio>
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
        <b-alert :show="cannotPlayAudioFormat" variant="warning" class="ml-auto mt-3 mb-0 my-lg-auto">
          <fa icon="warning" class="mr-2" />
          {{ $t('document.player.audio.unknownFormat') }}
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
  name: 'AudioViewer',
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  computed: {
    cannotPlayAudioFormat() {
      return !this.canPlayAudioFormat
    },
    canPlayAudioFormat() {
      return document.createElement('audio').canPlayType(this.document.contentType) !== ''
    },
    cardVariant() {
      return this.cannotPlayAudioFormat ? 'warning' : null
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
