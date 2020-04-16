<template>
  <div>
    <div v-if="!$config.is('multipleProjects')">
      <div class="bg-white">
        <div class="container py-5">
          <h3>{{ $t('settings.title') }}</h3>
          <div>{{ $t('settings.description') }}</div>
        </div>
      </div>
      <div class="container my-4">
        <v-wait for="load_data">
          <fa icon="circle-notch" spin size="2x" class="d-flex mx-auto mt-5" slot="waiting" />
          <b-form @submit.prevent="onSubmit">
            <b-form-group v-for="(value, name) in settings" :key="name" label-cols-xs="12" label-cols-sm="4" label-cols-lg="3">
              <template v-slot:label>
                <span :class="{ 'font-weight-bold': fieldChanged(name) }" class="d-flex align-items-top">
                  <span class="flex-grow-1 pb-1" :title="name">
                    {{ name | sentenceCase | capitalizeKnownAcronyms }}
                  </span>
                  <span>
                    <b-btn variant="link text-muted" size="sm py-0" v-if="fieldChanged(name)" @click="restore(name)">
                      <fa icon="undo" />
                    </b-btn>
                  </span>
                </span>
              </template>
              <b-form-input v-model="settings[name]" />
            </b-form-group>
            <b-row>
              <b-col offset-xs="0" offset-sm="4" offset-lg="3">
                <b-button type="submit" variant="primary">
                  {{ $t('settings.submit') }}
                </b-button>
              </b-col>
            </b-row>
          </b-form>
        </v-wait>
      </div>
    </div>
    <div v-else class="m-4">
      <b-alert variant="danger" show>
        {{ $t('settings.noAccess') }}
      </b-alert>
    </div>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'

const KNOWN_ACRONYMS = ['URI', 'URL', 'NLP', 'OCR', 'TCP', 'API', 'TTL', 'OAuth', 'CORS']

export default {
  name: 'Settings',
  filters: {
    sentenceCase (str) {
      const result = str.replace(/([A-Z])/g, ' $1')
      return result.charAt(0).toUpperCase() + result.slice(1)
    },
    capitalizeKnownAcronyms (str) {
      return str.split(' ').map(word => {
        const knownAcronyms = KNOWN_ACRONYMS.map(a => a.toUpperCase())
        const index = knownAcronyms.indexOf(word.toUpperCase())
        if (index > -1) {
          return KNOWN_ACRONYMS[index]
        }
        return word
      }).join(' ')
    }
  },
  data () {
    return {
      master: {},
      settings: {}
    }
  },
  async mounted () {
    this.$wait.start('load_data')
    const master = await this.$store.dispatch('settings/getSettings')
    this.$set(this, 'master', master)
    this.$set(this, 'settings', cloneDeep(master))
    this.$wait.end('load_data')
  },
  methods: {
    fieldChanged (field) {
      return this.settings[field] !== this.master[field]
    },
    restore (field) {
      this.settings[field] = this.master[field]
    },
    async onSubmit () {
      try {
        await this.$store.dispatch('settings/onSubmit', this.settings)
        this.$set(this, 'master', cloneDeep(this.settings))
        this.$bvToast.toast(this.$t('settings.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('settings.submitError'), { noCloseButton: true, variant: 'danger' })
      }
    }
  }
}
</script>
