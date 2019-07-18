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
            id="group-project"
            :label="$t('batchSearch.projectLabel')"
            label-for="project"
            v-if="isServer"
          >
            <b-form-select
              v-model="selectedIndex"
              :options="indices"
              required
            ></b-form-select>
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
    <div class="batchsearch__list my-3">
      <b-table striped hover :fields="fields" :items="items">
        <template #queries="row">
          <ul>
            <li v-for="query in row.item.queries" :key="query">{{ query }}</li>
          </ul>
        </template>
        <template #state="row">
          {{ capitalize(row.item.state) }}
        </template>
        <template #date="row">
          {{ moment(row.item.date).format('LLL') }}
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import utils from '@/mixins/utils'
import moment from 'moment'
import capitalize from 'lodash/capitalize'
import map from 'lodash/map'

export default {
  name: 'BatchSearches',
  mixins: [utils],
  data () {
    return {
      indices: [],
      fields: [
        {
          key: 'project.name',
          label: 'Project name',
          sortable: true
        },
        {
          key: 'name',
          label: 'Serarch name'
        },
        {
          key: 'description',
          sortable: true
        },
        {
          key: 'queries',
          sortable: true
        },
        {
          key: 'state',
          sortable: true
        },
        {
          key: 'date',
          sortable: true
        }
      ]
    }
  },
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
    },
    items () {
      return this.batchSearches
    }
  },
  mounted () {
    this.indices = map(this.$config.get('userIndices', []), value => { return { value, text: value } })
    return this.$store.dispatch('batchSearch/getBatchSearches')
  },
  methods: {
    onSubmit () {
      return this.$store.dispatch('batchSearch/onSubmit')
    },
    moment,
    capitalize
  }
}
</script>
