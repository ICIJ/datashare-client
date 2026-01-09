<template>
  <b-card
    class="audio-viewer my-3 w-100"
    overflow-hidden
    :border-variant="cardVariant"
  >
    <audio
      controls
      :autoplay="autoplay"
      :loop="loop"
      :src="document.inlineFullUrl"
      :type="document.contentType"
      class="audio-viewer__player w-100 d-inline-block"
    />
    <template #footer>
      <div class="d-lg-flex">
        <div
          switches
          class="my-auto d-flex"
        >
          <b-form-checkbox
            v-model="autoplay"
            switch
            class="my-2 me-3"
          >
            {{ t('document.player.autoplay') }}
          </b-form-checkbox>
          <b-form-checkbox
            v-model="loop"
            switch
            class="my-2 me-3"
          >
            {{ t('document.player.loop') }}
          </b-form-checkbox>
        </div>
        <b-alert
          :model-value="cannotPlayAudioFormat"
          variant="warning"
          class="ms-auto mt-3 mb-0 my-lg-auto"
        >
          <app-icon class="me-2">
            <i-ph-warning />
          </app-icon>
          {{ t('document.player.audio.unknownFormat') }}
        </b-alert>
      </div>
    </template>
  </b-card>
</template>

<script>
import { mapWritableState } from 'pinia'
import { AppIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import { usePlayerStore } from '@/store/modules/player'

/**
 * Display a preview video of the document.
 */
export default {
  name: 'DocumentViewerAudio',
  components: {
    AppIcon
  },
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  setup() {
    const { t } = useI18n()
    return { t }
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
    ...mapWritableState(usePlayerStore, ['loop', 'autoplay'])
  }
}
</script>
