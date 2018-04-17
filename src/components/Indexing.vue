<template>
  <div class="indexing">
    <form class="indexing__form input-group" @submit.prevent="submit">
      <div class="form-group">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="index" v-model="index">
          <label class="form-check-label" for="index">
            {{ $t('indexing.index_stage_label') }}
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="extract" v-model="extract">
          <label class="form-check-label" for="extract">
            {{ $t('indexing.extract_stage_label') }}
          </label>
        </div>
      </div>
      <div class="form-group">
        <label for="path">Path</label>
        <input id="path" v-model="path"/>
      </div>
      <div class="form-group">
        <label for="pipeline">NLP Pipeline</label>
            <select class="form-control" id="pipeline" v-model="pipeline">
              <option value="CORENLP">Core NLP</option>
              <option value="OPENNLP">Open NLP</option>
              <option value="MITIE">Mitie</option>
              <option value="IXAPIPE">Ixa Pipe</option>
              <option value="GATENLP">Gate NLP</option>
            </select>
      </div>
      <div class="form-group">
        <button class="btn btn-primary" type="submit">{{ $t('indexing.btnLabel') }}</button>
      </div>
    </form>
  </div>
</template>

<script>

import { createHelpers } from 'vuex-map-fields'

const { mapFields } = createHelpers({
  getterType: `indexing/getField`,
  mutationType: `indexing/updateField`
})

export default {
  name: 'indexing',
  computed: {
    ...mapFields([
      'form.pipeline', 'form.index', 'form.extract', 'form.path'
    ])
  },
  methods: {
    submit () {
      this.$store.dispatch('indexing/query')
    }
  }
}
</script>

<style scoped>

</style>
