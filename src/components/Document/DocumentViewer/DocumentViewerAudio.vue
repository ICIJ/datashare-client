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
      @error="onPlayerError"
      @canplay="onCanPlay"
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
          :model-value="cannotPlay"
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
import { AppIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'

import { usePlayerStore } from '@/store/modules/player'

/**
 * Display a preview audio of the document.
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
  data() {
    return {
      cannotPlay: false
    }
  },
  computed: {
    cardVariant() {
      return this.cannotPlay ? 'warning' : null
    },
    ...mapWritableState(usePlayerStore, ['loop', 'autoplay'])
  },
  methods: {
    onPlayerError(e) {
      this.cannotPlay = e.target?.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
    },
    onCanPlay() {
      this.cannotPlay = false
    }
  }
}
</script>
