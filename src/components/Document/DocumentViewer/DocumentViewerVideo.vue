<template>
  <b-card
    class="video-viewer align-self-center w-100 overflow-hidden my-3"
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
          <b-form-checkbox v-model="autoplay" switch class="my-2 me-3">
            {{ $t('document.player.autoplay') }}
          </b-form-checkbox>
          <b-form-checkbox v-model="loop" switch class="my-2 me-3">
            {{ $t('document.player.loop') }}
          </b-form-checkbox>
        </div>
        <b-alert :model-value="cannotPlayVideoFormat" variant="warning" class="ms-auto mt-3 mb-0 my-lg-auto">
          <phosphor-icon :name="PhWarning" class="me-2" />
          {{ $t('document.player.video.unknownFormat') }}
        </b-alert>
      </div>
    </template>
  </b-card>
</template>

<script>
import { mapWritableState } from 'pinia'
import { PhosphorIcon } from '@icij/murmur-next'

import { usePlayerStore } from '@/store/modules'

/**
 * Display a preview video of the document.
 */
export default {
  name: 'DocumentViewerVideo',
  components: {
    PhosphorIcon
  },
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
    ...mapWritableState(usePlayerStore, ['autoplay', 'loop'])
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
