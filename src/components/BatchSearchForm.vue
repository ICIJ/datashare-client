<template>
  <div class="batch-search-form m-3">
    <b-form @submit.prevent="onSubmit">
      <h5 class="text-light py-1">
        {{ $t('batchSearch.form.heading') }}
      </h5>
      <div class="card w-100">
        <div class="card-body pb-1 small">
          <b-form-group
            :label="`${$t('batchSearch.name')}:`">
            <b-form-input
              v-model="name"
              type="text"
              required></b-form-input>
          </b-form-group>
          <b-form-group
            :label="$t('batchSearch.form.fileLabel')"
            :description="$t('batchSearch.form.fileDescription')">
            <b-form-file
              v-model="csvFile"
              :placeholder="$t('batchSearch.form.filePlaceholder')"
              accept=".csv"
              required></b-form-file>
          </b-form-group>
          <b-form-group
            :label="`${$t('batchSearch.fuzziness')}:`">
            <b-form-input
              type="number"
              v-model="fuzziness"
              required></b-form-input>
          </b-form-group>
          <b-form-group
            :label="`${$t('batchSearch.fileTypes')}:`">
            <b-form-input
              v-model="fileTypes"
              @input="searchTerms">
            </b-form-input>
            <selectable-dropdown
              ref="suggestions"
              @input="selectTerm"
              :hide="!suggestions.length"
              :items="suggestions">
            </selectable-dropdown>
          </b-form-group>
          <b-form-group
            :label="`${$t('batchSearch.description')}:`">
            <b-form-textarea
              v-model="description"
              rows="2"
              max-rows="6"></b-form-textarea>
          </b-form-group>
          <b-form-group
            :label="`${$t('batchSearch.project')}:`"
            v-if="$config.is('multipleProjects')">
            <b-form-select
              v-model="project"
              :options="indices"
              required></b-form-select>
          </b-form-group>
        </div>
        <div class="card-footer">
          <div class="d-flex align-items-center">
            <div class="flex-grow-1">
              <b-form-checkbox v-model="published" switch>
                {{ $t('batchSearch.published') }}
              </b-form-checkbox>
            </div>
            <b-button type="submit" variant="primary">
              {{ $t('batchSearch.form.submit') }}
            </b-button>
          </div>
        </div>
      </div>
    </b-form>
  </div>
</template>

<script>
import types from '@/utils/types.json'
import filter from 'lodash/filter'
import keys from 'lodash/keys'
import map from 'lodash/map'
import throttle from 'lodash/throttle'

export default {
  name: 'BatchSearchForm',
  data () {
    return {
      name: '',
      published: true,
      csvFile: null,
      description: '',
      project: 'local-datashare',
      fuzziness: 0,
      fileTypes: '',
      indices: [],
      suggestions: []
    }
  },
  computed: {
    allTypes () {
      return keys(types)
    }
  },
  created () {
    this.$set(this, 'indices', map(this.$config.get('userIndices', []), value => { return { value, text: value } }))
  },
  methods: {
    searchTerms: throttle(async function () {
      const searchedTerm = this.fileTypes.split(' ').pop()
      this.$set(this, 'suggestions', filter(this.allTypes, item => item.indexOf(searchedTerm) > -1))
    }, 200),
    selectTerm (term) {
      if (term) {
        const fileTypesArray = this.fileTypes.split(' ')
        // Remove last item
        fileTypesArray.pop()
        // Append the clicked term
        fileTypesArray.push(term)
        this.fileTypes = fileTypesArray.join(' ')
        this.$set(this, 'suggestions', [])
      }
    },
    resetForm () {
      this.$set(this, 'name', '')
      this.$set(this, 'published', true)
      this.$set(this, 'csvFile', null)
      this.$set(this, 'description', '')
      this.$set(this, 'project', 'local-datashare')
      this.$set(this, 'fuzziness', 0)
      this.$set(this, 'fileTypes', '')
    },
    async onSubmit () {
      await this.$store.dispatch('batchSearch/onSubmit', { name: this.name, published: this.published, csvFile: this.csvFile, description: this.description, project: this.project, fuzziness: this.fuzziness, fileTypes: this.fileTypes })
      this.resetForm()
      if (this.$config.is('manageDocuments')) {
        try {
          await this.$store.dispatch('indexing/runBatchSearch')
          this.$bvToast.toast(this.$t('batchSearch.form.success'), { noCloseButton: true, variant: 'success' })
        } catch (_) {
          this.$bvToast.toast(this.$t('batchSearch.form.failure'), { noCloseButton: true, variant: 'danger' })
        }
      }
    }
  }
}
</script>
