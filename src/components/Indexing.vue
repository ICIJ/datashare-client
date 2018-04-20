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
          <div class="form-group card-body my-0">
            <label for="path">Path</label>
            <input id="path" v-model="path" class="form-control "/>
          </div>
          <div class="form-group card-body my-0">
            <label for="pipeline">NLP Pipeline</label>
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
              {{ task.name }}
              <span class="badge badge-pill small float-right">
                {{ task.state }}
              </span>
              <div class="indexing__tasks__progress progress">
                <div class="progress-bar" :class="taskStateToClass(task.state)" role="progressbar" :style="'width: ' + task.progress * 100 + '%'" :aria-valuenow="task.progress * 100" aria-valuemin="0" aria-valuemax="100">
                  {{ Math.round(task.progress * 100) }}%
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

const { mapFields } = createHelpers({
  getterType: `indexing/getField`,
  mutationType: `indexing/updateField`
})

export default {
  name: 'indexing',
  computed: {
    ...mapFields(['form.pipeline', 'form.index', 'form.extract', 'form.path']),
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
    taskStateToClass (state) {
      switch (state) {
        case ('DONE'): return 'bg-success'
        case ('EXECPT'): return 'bg-danger'
        case ('RUNNING'): return 'bg-info'
      }
    }
  }
}
</script>

<style scoped>

</style>
