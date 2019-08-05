<template>
  <div class="batch-search-form">
    <b-form @submit.prevent="onSubmit" class="m-3">
      <div class="card">
        <div class="m-4">
          <h3 class="h5 mb-4">
            New batch search
          </h3>
          <b-form-group
            id="group-name"
            :label="$t('batchSearch.form.nameLabel')"
            label-for="name">
            <b-form-input
              id="name"
              v-model="name"
              type="text"
              required
              :placeholder="$t('batchSearch.form.namePlaceholder')"></b-form-input>
          </b-form-group>
          <b-form-group
            id="group-description"
            :label="$t('batchSearch.form.descriptionLabel')"
            label-for="description">
            <b-form-textarea
              id="description"
              v-model="description"
              :placeholder="$t('batchSearch.form.descriptionPlaceholder')"
              rows="3"
              max-rows="6"></b-form-textarea>
          </b-form-group>
          <b-form-group
            id="group-project"
            :label="$t('batchSearch.form.projectLabel')"
            label-for="project"
            v-if="isServer">
            <b-form-select
              v-model="selectedIndex"
              :options="indices"
              required></b-form-select>
          </b-form-group>
          <b-form-group
            id="group-file"
            :label="$t('batchSearch.form.fileLabel')"
            label-for="file"
            :description="$t('batchSearch.form.fileDescription')">
            <b-form-file
              v-model="csvFile"
              :placeholder="$t('batchSearch.form.filePlaceholder')"
              accept=".csv"
              required></b-form-file>
          </b-form-group>
        </div>
        <div class="card-footer text-right border-0">
          <b-button type="submit" variant="primary">{{ $t('batchSearch.form.submit') }}</b-button>
        </div>
      </div>
    </b-form>
  </div>
</template>

<script>
import utils from '@/mixins/utils'
import map from 'lodash/map'

export default {
  name: 'BatchSearchForm',
  mixins: [utils],
  data () {
    return {
      indices: []
    }
  },
  computed: {
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
    selectedIndex: {
      get: function () {
        return this.$store.state.batchSearch.index
      },
      set: function (index) {
        this.$store.commit('batchSearch/index', index)
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
  created () {
    this.indices = map(this.$config.get('userIndices', []), value => { return { value, text: value } })
  },
  methods: {
    onSubmit () {
      return this.$store.dispatch('batchSearch/onSubmit')
    }
  }
}
</script>
