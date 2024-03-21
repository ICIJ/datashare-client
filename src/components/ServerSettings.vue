<template>
  <div>
    <div v-if="!isServer">
      <div class="container my-4">
        <v-wait for="load server settings">
          <template #waiting>
            <fa icon="circle-notch" spin size="2x" class="d-flex mx-auto mt-5"></fa>
          </template>
          <b-form @submit.prevent="onSubmit">
            <b-form-group
              v-for="(_, name) in settings"
              :key="name"
              class="mb-3"
              label-cols-xs="12"
              label-cols-sm="4"
              label-cols-lg="3"
            >
              <template #label>
                <span :class="{ 'fw-bold': fieldChanged(name) }" class="d-flex align-items-top">
                  <span class="flex-grow-1 pb-1" :title="name">
                    {{ formatSettingName(name) }}
                  </span>
                  <span>
                    <b-button v-if="fieldChanged(name)" variant="link text-muted" size="sm py-0" @click="restore(name)">
                      <fa icon="undo"></fa>
                    </b-button>
                  </span>
                </span>
              </template>
              <b-form-input v-model="settings[name]"></b-form-input>
            </b-form-group>
            <b-row>
              <b-col offset-xs="0" offset-sm="4" offset-lg="3">
                <b-button type="submit" variant="primary">
                  {{ $t('global.submit') }}
                </b-button>
              </b-col>
            </b-row>
          </b-form>
        </v-wait>
      </div>
    </div>
    <div v-else class="m-4">
      <b-alert variant="danger" show>
        {{ $t('serverSettings.noAccess') }}
      </b-alert>
    </div>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'

import utils from '@/mixins/utils'

const KNOWN_ACRONYMS = ['URI', 'URL', 'NLP', 'OCR', 'TCP', 'API', 'TTL', 'OAuth', 'CORS']
/**
 * A list of settings for the backend (only available in local mode).
 */
export default {
  name: 'ServerSettings',
  mixins: [utils],
  data() {
    return {
      master: {},
      settings: {}
    }
  },
  async mounted() {
    this.$wait.start('load server settings')
    const master = await this.$store.dispatch('settings/getSettings')
    this.master = master
    this.settings = cloneDeep(master)
    this.$wait.end('load server settings')
  },
  methods: {
    sentenceCase(str) {
      const result = str.replace(/([A-Z])/g, ' $1')
      return result.charAt(0).toUpperCase() + result.slice(1)
    },
    capitalizeKnownAcronyms(str) {
      return str
        .split(' ')
        .map((word) => {
          const knownAcronyms = KNOWN_ACRONYMS.map((a) => a.toUpperCase())
          const index = knownAcronyms.indexOf(word.toUpperCase())
          if (index > -1) {
            return KNOWN_ACRONYMS[index]
          }
          return word
        })
        .join(' ')
    },
    formatSettingName(name) {
      return this.capitalizeKnownAcronyms(this.sentenceCase(name))
    },
    fieldChanged(field) {
      return this.settings[field] !== this.master[field]
    },
    restore(field) {
      this.settings[field] = this.master[field]
    },
    async onSubmit() {
      try {
        await this.$store.dispatch('settings/onSubmit', this.settings)
        this.$config.merge(this.settings)
        this.master = cloneDeep(this.settings)
        this.$bvToast.toast(this.$t('serverSettings.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.settings = cloneDeep(this.master)
        this.$bvToast.toast(this.$t('serverSettings.submitError'), { noCloseButton: true, variant: 'danger' })
      }
    }
  }
}
</script>
