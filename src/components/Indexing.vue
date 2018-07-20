<template>
  <div class="indexing container-fluid">
    <div class="row">
      <form class="indexing__form mt-4 col-lg-3 col-md-4 order-last" @submit.prevent="submit">
        <div class="card">
          <div class="card-header">
            <h3 class="h5 m-0">
              {{ $t('indexing.new') }}
            </h3>
          </div>
          <div class="form-group card-body my-0">
            <div class="form-check">
              <input class="form-check-input" type="radio" id="index" name="action" value="index" v-model="action">
              <label class="form-check-label" for="index">
                {{ $t('indexing.index_stage_label') }}
              </label>
            </div>
            <div class="form-group card-body my-0" v-if="action === 'index'">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="ocr" v-model="ocr">
                <label class="form-check-label" for="ocr">
                  {{ $t('indexing.enable_ocr') }}
                </label>
              </div>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" id="findNames" name="action" value="findNames" v-model="action">
              <label class="form-check-label" for="findNames">
                {{ $t('indexing.findNames_stage_label') }}
              </label>
            </div>
          </div>
          <div class="form-group card-body my-0" v-if="action === 'findNames'">
            <label for="pipeline">Named Entities Finders</label>
            <select class="form-control" id="pipeline" v-model="pipeline">
              <option value="CORENLP">Core NLP</option>
              <option value="OPENNLP">Open NLP</option>
              <option value="MITIE">Mitie</option>
              <option value="IXAPIPE">Ixa Pipe</option>
              <option value="GATENLP">Gate NLP</option>
            </select>
          </div>
          <div class="form-group card-footer mb-0">
            <button class="btn btn-icij" type="submit">
              {{ $t('indexing.btnLabel') }}
            </button>
          </div>
        </div>
      </form>
      <div class="col-lg-9 col-md-8 mt-4" v-if="tasks.length">
        <div class="card">
          <div class="card-header">
            <h3 class="h5 m-0">
              {{ $t('indexing.ongoing') }}
            </h3>
          </div>
          <ul class="list-group list-group-flush">
            <li v-for="task in tasks" :key="task.name" class="indexing__tasks list-group-item">
              {{ taskLabel(task.name) }}
              <span class="badge badge-pill small float-right">
                {{ task.state }}
              </span>
              <div class="indexing__tasks__progress progress">
                <div class="progress-bar" :class="taskStateToClass(task.state)" role="progressbar" :style="'width: ' + getProgress(task.progress) + '%'" :aria-valuenow="getProgress(task.progress)" aria-valuemin="0" aria-valuemax="100">
                  {{ getProgress(task.progress) }}%
                </div>
              </div>
            </li>
          </ul>
          <div class="card-footer text-right border-0">
            <button class="btn btn-icij" type="button" @click="cleanTasks">
              {{ $t('indexing.purge') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { createHelpers } from 'vuex-map-fields'
import {mapState} from 'vuex'
import last from 'lodash/last'

const { mapFields } = createHelpers({
  getterType: `indexing/getField`,
  mutationType: `indexing/updateField`
})

export default {
  name: 'indexing',
  computed: {
    ...mapFields(['form.pipeline', 'form.action', 'form.ocr']),
    ...mapState('indexing', {tasks: state => state.tasks})
  },
  beforeRouteEnter (to, _from, next) {
    next(vm => {
      vm.$store.commit('indexing/startPolling')
    })
  },
  beforeRouteLeave (to, _from, next) {
    this.$store.commit('indexing/stopPolling')
    next()
  },
  methods: {
    submit () {
      this.$store.dispatch('indexing/query')
    },
    cleanTasks () {
      this.$store.dispatch('indexing/cleanTasks')
    },
    taskLabel (name) {
      let nameAndId = last(name.split('.')).split('@')
      return nameAndId[0] + '(' + nameAndId[1] + ')'
    },
    taskStateToClass (state) {
      switch (state) {
        case ('DONE'): return 'bg-success'
        case ('ERROR'): return 'bg-danger'
        case ('CANCELLED'): return 'bg-warning'
        case ('RUNNING'): return 'bg-info'
      }
    },
    getProgress (value) {
      if (value === -2.0) {
        return 100
      }
      if (value === -1.0) {
        return 0
      }
      return Math.round(value * 100)
    }
  }
}
</script>
