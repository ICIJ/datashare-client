<template>
  <div class="batch-search-form m-3">
    <b-form @submit.prevent="onSubmit">
      <h4 class="text-light py-1">
        {{ $t('batchSearch.form.heading') }}
      </h4>
      <div class="card w-100">
        <div class="card-body pb-1 small">
          <div class="row">
            <b-form-group
              id="group-name"
              :label="$t('batchSearch.form.nameLabel')"
              label-for="name"
              class="col-12">
              <b-form-input
                id="name"
                v-model="name"
                type="text"
                required
                :placeholder="$t('batchSearch.form.namePlaceholder')"></b-form-input>
            </b-form-group>
            <b-form-group
              id="group-file"
              :label="$t('batchSearch.form.fileLabel')"
              label-for="file"
              :description="$t('batchSearch.form.fileDescription')"
              class="col-12">
              <b-form-file
                v-model="csvFile"
                :placeholder="$t('batchSearch.form.filePlaceholder')"
                accept=".csv"
                required></b-form-file>
            </b-form-group>
          </div>
          <b-form-group
            :label="`${$t('batchSearch.fuzziness')}:`"
            label-for="fuzziness">
            <b-form-input
              id="type-number"
              type="number"
              v-model="fuzziness"
              required></b-form-input>
          </b-form-group>
          <b-form-group
            id="group-description"
            :label="$t('batchSearch.form.descriptionLabel')"
            label-for="description">
            <b-form-textarea
              id="description"
              v-model="description"
              :placeholder="$t('batchSearch.form.descriptionPlaceholder')"
              rows="2"
              max-rows="6"></b-form-textarea>
          </b-form-group>
          <b-form-group
            id="group-project"
            :label="$t('batchSearch.form.projectLabel')"
            label-for="project"
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
import map from 'lodash/map'

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
      indices: []
    }
  },
  created () {
    this.indices = map(this.$config.get('userIndices', []), value => { return { value, text: value } })
  },
  methods: {
    resetForm () {
      this.$set(this, 'name', '')
      this.$set(this, 'published', true)
      this.$set(this, 'csvFile', null)
      this.$set(this, 'description', '')
      this.$set(this, 'project', 'local-datashare')
      this.$set(this, 'fuzziness', 0)
    },
    async onSubmit () {
      await this.$store.dispatch('batchSearch/onSubmit', { name: this.name, published: this.published, csvFile: this.csvFile, description: this.description, project: this.project, fuzziness: this.fuzziness })
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
