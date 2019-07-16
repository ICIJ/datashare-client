<template>
  <div class="batchsearch container pt-4">
    <b-form @submit.prevent="onSubmit">
      <div class="card">
        <div class="card-header">
          <h3 class="h5 m-0">
            {{ $t('batchSearch.title') }}
          </h3>
        </div>
        <div class="m-4">
          <b-form-group
            id="group-name"
            :label="$t('batchSearch.nameLabel')"
            label-for="name"
          >
            <b-form-input
              id="name"
              v-model="name"
              type="text"
              required
              :placeholder="$t('batchSearch.namePlaceholder')"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            id="group-description"
            :label="$t('batchSearch.descriptionLabel')"
            label-for="description"
          >
            <b-form-textarea
              id="description"
              v-model="description"
              :placeholder="$t('batchSearch.descriptionPlaceholder')"
              rows="3"
              max-rows="6"
            ></b-form-textarea>
          </b-form-group>
          <b-form-group
            id="group-file"
            :label="$t('batchSearch.fileLabel')"
            label-for="file"
            :description="$t('batchSearch.fileDescription')"
          >
            <b-form-file
              v-model="csvFile"
              :placeholder="$t('batchSearch.filePlaceholder')"
              accept=".csv"
              required
            ></b-form-file>
          </b-form-group>
        </div>
        <div class="card-footer text-right border-0">
          <b-button type="submit" variant="primary">{{ $t('batchSearch.submit') }}</b-button>
        </div>
      </div>
    </b-form>
    <div class="batchsearch__list">
      <div class="container py-3" v-if="batchSearches.length">
        <div v-for="batchSearch in batchSearches" :key="batchSearch.uuid" class="row my-3">
          <div class="col col-sm-2">
            {{ batchSearch.project.name }}
          </div>
          <div class="col col-sm-2">
            {{ batchSearch.name }}
          </div>
          <div class="col col-sm-2">
            {{ batchSearch.description }}
          </div>
          <div class="col col-sm-3">
            {{ batchSearch.queries }}
          </div>
          <div class="col col-sm-3">
            {{ moment(batchSearch.date).format('LLL') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'

export default {
  name: 'BatchSearches',
  computed: {
    ...mapState('batchSearch', ['batchSearches']),
    name: {
      get () {
        return this.$store.state.batchSearch.name
      },
      set (name) {
        this.$store.commit('batchSearch/name', name)
      }
    },
    description: {
      get () {
        return this.$store.state.batchSearch.description
      },
      set (description) {
        this.$store.commit('batchSearch/description', description)
      }
    },
    csvFile: {
      get () {
        return this.$store.state.batchSearch.csvFile
      },
      set (csvFile) {
        this.$store.commit('batchSearch/csvFile', csvFile)
      }
    }
  },
  mounted () {
    return this.$store.dispatch('batchSearch/getBatchSearches')
  },
  methods: {
    onSubmit () {
      return this.$store.dispatch('batchSearch/onSubmit')
    },
    moment
  }
}
</script>
