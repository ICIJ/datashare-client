<template>
  <div class="indexing">
    <page-header icon="rocket" :title="$t('indexing.title')" :description="$t('indexing.description', { howToLink })">
      <div>
        <div class="text-right">
          <button class="btn btn-primary mr-2 btn-extract" type="button" @click="openExtractingForm">
            <fa icon="rocket" class="mr-2"></fa>
            {{ $t('indexing.extractText') }}
          </button>
          <span class="span-find-named-entities" v-b-tooltip.hover :title="findNamedEntitiesTooltip">
            <button class="btn btn-primary btn-find-named-entites mr-2" type="button"
                    :disabled="isPendingTasks" @click="openFindNamedEntitiesForm">
              <fa icon="user-tag" class="mr-2"></fa>
              {{ $t('indexing.findNamedEntities') }}
            </button>
          </span>
        </div>
        <b-modal ref="extractingForm" hide-footer modal-class="indexing__form-modal extracting__form" size="md">
          <template #modal-title>
            <fa icon="rocket" class="mr-1"></fa>
            {{ $t('indexing.extractText') }}
          </template>
          <extracting-form id="extracting-form" :finally="closeExtractingForm"></extracting-form>
        </b-modal>
        <b-modal ref="findNamedEntitiesForm" hide-footer modal-class="indexing__form-modal find-named-entities__form" size="md">
          <template #modal-title>
            {{ $t('indexing.findNamedEntities') }}
          </template>
          <find-named-entities-form id="find-named-entities-form" :finally="closeFindNamedEntitiesForm"></find-named-entities-form>
        </b-modal>
      </div>
    </page-header>
    <div class="mt-4 container">
      <div class="card">
        <div class="card-header">
          <h3 class="h5 m-0">
            {{ $t('indexing.tasks') }}
          </h3>
        </div>
        <v-wait for="load indexing tasks">
          <fa icon="circle-notch" slot="waiting" spin size="2x" class="d-flex mx-auto my-3"></fa>
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
                <button class="btn btn-link btn-stop-task" :title="$t('indexing.stopTask')"
                        @click="task.state === 'RUNNING' ? stopTask(task.name) : ''" :disabled="task.state !== 'RUNNING'">
                  <fa icon="times-circle" :class="[task.state !== 'RUNNING' ? 'muted' : '']"></fa>
                </button>
              </div>
            </li>
          </ul>
          <div v-else class="px-4 py-2 text-center text-muted">
            {{ $t('indexing.empty') }}
          </div>
        </v-wait>
        <div class="card-footer text-right border-0" v-if="isPendingTasks||isDoneTasks">
          <button class="btn btn-primary btn-stop-pending-tasks mr-2"
                  type="button" :disabled="!isPendingTasks" @click="stopPendingTasks">
            {{ $t('indexing.stopPendingTasks') }}
          </button>
          <button class="btn btn-primary btn-delete-done-tasks"
                  type="button" :disabled="!isDoneTasks" @click="deleteDoneTasks">
            <fa icon="trash-alt" class="mr-1"></fa>
            {{ $t('indexing.deleteDoneTasks') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { filter, last } from 'lodash'
import { mapState } from 'vuex'

import ExtractingForm from '@/components/ExtractingForm'
import FindNamedEntitiesForm from '@/components/FindNamedEntitiesForm'
import PageHeader from '@/components/PageHeader'
import settings from '@/utils/settings'
import { getOS, toVariant } from '@/utils/utils'

export default {
  name: 'indexing',
  components: {
    ExtractingForm,
    FindNamedEntitiesForm,
    PageHeader
  },
  computed: {
    ...mapState('indexing', ['tasks']),
    isPendingTasks () {
      return filter(this.tasks, { state: 'RUNNING' }).length !== 0
    },
    isDoneTasks () {
      return filter(this.tasks, { state: 'DONE' }).length !== 0
    },
    findNamedEntitiesTooltip () {
      return this.isPendingTasks ? this.$t('indexing.findNamedEntitiesTooltip') : ''
    },
    howToLink () {
      const os = getOS()
      return settings.documentationLinks.indexing[os] || settings.documentationLinks.indexing.default
    }
  },
  async mounted () {
    this.$wait.start('load indexing tasks')
    await this.$store.dispatch('indexing/getTasks')
    await this.$store.dispatch('indexing/startPollTasks')
    const hits = await this.$store.dispatch('search/query', '*')
    if (hits.hits.total === 0 && this.tasks.length === 0) {
      this.openExtractingForm()
    }
    this.$wait.end('load indexing tasks')
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit('indexing/stopPolling')
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
      return this.$store.dispatch('indexing/stopPendingTasks')
    },
    stopTask (name) {
      this.$store.dispatch('indexing/stopTask', name)
    },
    deleteDoneTasks () {
      this.$store.dispatch('indexing/deleteDoneTasks')
    },
    taskLabel (name) {
      const nameAndId = last(name.split('.')).split('@')
      return nameAndId[0] + ' <span class="badge badge-light text-muted">' + nameAndId[1] + '</span>'
    },
    taskStateToClass (state) {
      if (state === 'RUNNING') {
        return 'bg-info progress-bar-striped progress-bar-animated'
      } else {
        return `bg-${toVariant(state)}`
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
