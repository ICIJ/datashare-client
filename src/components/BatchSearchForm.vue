<template>
  <div class="batch-search-form">
    <b-form @submit.prevent="onSubmit">
      <div class="card m-3">
        <h6 class="card-header">
          {{ $t('batchSearch.form.heading') }}
        </h6>
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
              :label="$t('batchSearch.published')"
              class="col-12">
              <b-form-radio v-model="published" name="published" value="true">
                {{ $t('indexing.yes') }}
              </b-form-radio>
              <b-form-radio v-model="published" name="published" value="false">
                {{ $t('indexing.no') }}
              </b-form-radio>
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
              v-model="index"
              :options="indices"
              required></b-form-select>
          </b-form-group>
        </div>
        <div class="card-body text-right pt-0">
          <b-button type="submit" variant="primary">{{ $t('batchSearch.form.submit') }}</b-button>
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
      index: 'local-datashare',
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
      this.$set(this, 'index', 'local-datashare')
    },
    async onSubmit () {
      await this.$store.dispatch('batchSearch/onSubmit', { name: this.name, published: this.published, csvFile: this.csvFile, description: this.description, index: this.index })
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

<style lang="scss">
  .batch-search-form {
    width: 100%;
  }
</style>
