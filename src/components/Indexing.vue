<template>
  <div class="indexing container pt-4">
    <router-link :to="{ name: 'search' }" class="float-left py-2">
      <fa icon="chevron-circle-left" />
      {{ $t('search.back') }}
    </router-link>
    <div class="text-right">
      <button class="btn btn-primary mr-2 btn-extract" type="button" @click="openExtractingForm">
        <fa icon="rocket" class="mr-2" />
        {{ $t('indexing.extract_text') }}
      </button>
      <span class="span-find-named-entities" v-b-tooltip.hover :title="findNamedEntitiesTooltip">
        <button class="btn btn-primary btn-find-named-entites" type="button"
                :disabled="isPendingTasks" @click="openFindNamedEntitiesForm">
          {{ $t('indexing.find_named_entities') }}
        </button>
      </span>
    </div>
    <b-modal ref="extractingForm" hide-footer modal-class="indexing__form-modal extracting__form" size="md">
      <div slot="modal-title">
        <fa icon="rocket" class="mr-2" />
        {{ $t('indexing.extract_text') }}
      </div>
      <extracting-form id="extracting-form" :finally="closeExtractingForm" />
    </b-modal>
    <b-modal ref="findNamedEntitiesForm" hide-footer modal-class="indexing__form-modal find-named-entities__form" size="md">
      <div slot="modal-title">
        {{ $t('indexing.find_named_entities') }}
      </div>
      <find-named-entities-form id="find-named-entities-form" :finally="closeFindNamedEntitiesForm" />
    </b-modal>
    <div class="mt-4">
      <div class="card">
        <div class="card-header">
          <h3 class="h5 m-0">
            {{ $t('indexing.tasks') }}
          </h3>
        </div>
        <ul class="list-group list-group-flush" v-if="tasks.length">
          <li v-for="task in tasks" :key="task.name" class="indexing__tasks list-group-item d-flex">
            <div class="col">
              <div class="d-flex align-items-end mb-1">
                <span v-html="taskLabel(task.name)" class="w-100"></span>
                <span class="badge small mr-auto">
                {{ task.state }}
                </span>
              </div>
              <div class="indexing__tasks__progress progress">
                <div class="progress-bar" :class="taskStateToClass(task.state)" role="progressbar"
                     :style="'width: ' + getProgress(task.progress, task.state) + '%'" :aria-valuenow="getProgress(task.progress, task.state)"
                     aria-valuemin="0" aria-valuemax="100">
                  {{ getProgress(task.progress, task.state) }}%
                </div>
              </div>
            </div>
            <div class="col-md-auto p-0 my-auto">
              <button class="btn btn-link btn-stop-task" :title="$t('indexing.stop_task')"
                      @click="task.state === 'RUNNING' ? stopTask(task.name) : ''" :disabled="task.state !== 'RUNNING'">
                <fa icon="times-circle" :class="[task.state !== 'RUNNING' ? 'muted' : '']" />
              </button>
            </div>
          </li>
        </ul>
        <div v-else class="px-4 py-2 text-center text-muted">
          {{ $t('indexing.empty') }}
        </div>
        <div class="card-footer text-right border-0" v-if="isPendingTasks||isDoneTasks">
          <button class="btn btn-primary btn-stop-pending-tasks mr-2"
                  type="button" :disabled="!isPendingTasks" @click="stopPendingTasks">
            {{ $t('indexing.stop_pending_tasks') }}
          </button>
          <button class="btn btn-primary btn-delete-done-tasks"
                  type="button" :disabled="!isDoneTasks" @click="deleteDoneTasks">
            <fa icon="trash-alt" class="mr-1" />
            {{ $t('indexing.delete_done_tasks') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import bModal from 'bootstrap-vue/es/components/modal/modal'
import ExtractingForm from '@/components/ExtractingForm'
import FindNamedEntitiesForm from '@/components/FindNamedEntitiesForm'
import store from '@/store'
import filter from 'lodash/filter'
import last from 'lodash/last'

export default {
  name: 'indexing',
  components: { ExtractingForm, FindNamedEntitiesForm, bModal },
  computed: {
    ...mapState('indexing', ['tasks']),
    isPendingTasks () {
      return filter(this.tasks, { state: 'RUNNING' }).length !== 0
    },
    isDoneTasks () {
      return filter(this.tasks, { state: 'DONE' }).length !== 0
    },
    findNamedEntitiesTooltip () {
      return this.isPendingTasks ? this.$t('indexing.find_named_entities_tooltip') : ''
    }
  },
  mounted () {
    store.dispatch('search/query', '*').then(hits => {
      if (hits.hits.total === 0 && this.tasks.length === 0) {
        this.openExtractingForm()
      }
    })
  },
  beforeRouteEnter (to, from, next) {
    return store.dispatch('indexing/loadTasks').then(() => {
      store.dispatch('indexing/startPollTasks')
      return next()
    // Proceed anyway
    }, () => next())
  },
  beforeRouteLeave (to, from, next) {
    store.dispatch('indexing/stopPollTasks')
    next()
  },
  methods: {
    openExtractingForm () {
      this.$refs.extractingForm.show()
    },
    closeExtractingForm () {
      this.$refs.extractingForm.hide()
    },
    openFindNamedEntitiesForm () {
      this.$refs.findNamedEntitiesForm.show()
    },
    closeFindNamedEntitiesForm () {
      this.$refs.findNamedEntitiesForm.hide()
    },
    stopPendingTasks () {
      store.dispatch('indexing/stopPendingTasks')
    },
    stopTask (name) {
      store.dispatch('indexing/stopTask', name)
    },
    deleteDoneTasks () {
      store.dispatch('indexing/deleteDoneTasks')
    },
    taskLabel (name) {
      let nameAndId = last(name.split('.')).split('@')
      return nameAndId[0] + ' <span class="badge badge-light text-muted">' + nameAndId[1] + '</span>'
    },
    taskStateToClass (state) {
      switch (state) {
        case 'DONE': return 'bg-success'
        case 'ERROR': return 'bg-danger'
        case 'CANCELLED': return 'bg-warning'
        case 'RUNNING': return 'bg-info progress-bar-striped progress-bar-animated'
      }
    },
    getProgress (value, state) {
      let res
      switch (value) {
        case -2.0 :
        case 1.0 :
          res = (state === 'RUNNING') ? 99 : 100
          break
        case -1.0 :
          res = 0
          break
        default :
          res = Math.min(Math.round(value * 100), 99)
      }
      return res
    }
  }
}
</script>

<style lang="scss">
  .indexing {

    &__form-modal .modal-body {
      background: darken($primary, 20);
      color: white;
    }
  }
</style>
