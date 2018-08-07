<template>
  <div class="indexing container pt-4">
    <div class="text-right">
      <button class="btn btn-icij" type="button" @click="openTaskForm">
        <font-awesome-icon icon="rocket" class="mr-2" />
        {{ $t('indexing.new') }}
      </button>
    </div>
    <b-modal ref="indexingForm" hide-footer modal-class="indexing__form-modal" size="md">
      <div slot="modal-title">
        <font-awesome-icon icon="rocket" class="mr-2" />
        {{ $t('indexing.new') }}
      </div>
      <indexing-form id="indexing-form" :finally="closeTaskForm" />
    </b-modal>
    <div class="mt-4">
      <div class="card">
        <div class="card-header">
          <h3 class="h5 m-0">
            {{ $t('indexing.ongoing') }}
          </h3>
        </div>
        <ul class="list-group list-group-flush"  v-if="tasks.length">
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
        <div v-else class="px-4 py-2 text-center text-muted">
          {{ $t('indexing.empty') }}
        </div>
        <div class="card-footer text-right border-0" v-if="tasks.length">
          <button class="btn btn-icij" type="button" @click="cleanTasks">
            {{ $t('indexing.purge') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import bModal from 'bootstrap-vue/es/components/modal/modal'
import last from 'lodash/last'

import store from '@/store'
import IndexingForm from './IndexingForm'

export default {
  name: 'indexing',
  components: { IndexingForm, bModal },
  computed: {
    ...mapState('indexing', { tasks: state => state.tasks })
  },
  created () {
    this.$store.dispatch('search/query')
  },
  mounted () {
    if (this.tasks.length === 0) {
      this.openTaskForm()
    }
  },
  beforeRouteEnter (to, from, next) {
    store.dispatch('indexing/loadTasks').then(() => {
      store.dispatch('indexing/startPollTasks')
      next()
    // Proceed anyway
    }, () => next())
  },
  beforeRouteLeave (to, from, next) {
    this.$store.dispatch('indexing/stopPollTasks')
    next()
  },
  methods: {
    openTaskForm () {
      this.$refs.indexingForm.show()
    },
    closeTaskForm () {
      this.$refs.indexingForm.hide()
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

<style lang="scss">
  .indexing {

    &__form-modal .modal-body {
      background: theme-color('icij');
      color: white;
    }
  }
</style>
