<template>
  <div class="indexing container-fluid">
    <div class="row">
      <indexing-form class="mt-4 col-lg-3 col-md-4 order-last" id="indexing-form" />
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
import { mapState } from 'vuex'
import last from 'lodash/last'

import IndexingForm from './IndexingForm'

export default {
  name: 'indexing',
  components: { IndexingForm },
  computed: {
    ...mapState('indexing', { tasks: state => state.tasks })
  },
  created () {
    this.$store.dispatch('search/query')
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
