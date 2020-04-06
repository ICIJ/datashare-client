<template>
  <div>
    <div v-if="!$config.is('multipleProjects')">
      <div class="bg-white">
        <div class="container py-5">
          <h3>{{ $t('config.title') }}</h3>
        </div>
      </div>
      <div class="container my-4">
        <v-wait for="load_data">
          <fa icon="circle-notch" spin size="2x" class="d-flex mx-auto mt-5" slot="waiting" />
          <b-form @submit.prevent="onSubmit">
            <b-form-group v-for="(value, name) in config" :key="name" label-cols-xs="12" label-cols-sm="4" label-cols-lg="3">
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
              <b-form-input v-model="config[name]" />
            </b-form-group>
            <b-row>
              <b-col offset-xs="0" offset-sm="4" offset-lg="3">
                <b-button type="submit" variant="primary">
                  {{ $t('config.submit') }}
                </b-button>
              </b-col>
            </b-row>
          </b-form>
        </v-wait>
      </div>
    </div>
    <div v-else class="m-4">
      <b-alert variant="danger" show>
        {{ $t('config.noAccess') }}
      </b-alert>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'

const KNOWN_ACRONYMS = ['URI', 'URL', 'NLP', 'OCR', 'TCP', 'API', 'TTL', 'OAuth', 'CORS']

export default {
  name: 'Config',
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
      config: {},
      master: {}
    }
  },
  async mounted () {
    this.$wait.start('load_data')
    const master = await this.$store.dispatch('config/getConfig')
    this.$set(this, 'master', master)
    this.$set(this, 'config', cloneDeep(master))
    this.$wait.end('load_data')
  },
  methods: {
    fieldChanged (field) {
      return this.config[field] !== this.master[field]
    },
    restore (field) {
      this.config[field] = this.master[field]
    },
    async onSubmit () {
      try {
        await this.$store.dispatch('config/onSubmit', this.config)
        this.$bvToast.toast(this.$t('config.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('config.submitError'), { noCloseButton: true, variant: 'danger' })
      }
    }
  }
}
</script>
