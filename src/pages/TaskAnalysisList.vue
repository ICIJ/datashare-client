<template>
  <div class="task-analysis-list">
    <div class="mt-4 container">
      <div class="mb-3 d-flex">
        <b-btn-group class="task-analysis-list__actions mr-2">
          <b-btn
            class="task-analysis-list__actions__stop-pending-tasks"
            variant="outline-primary"
            type="b-btn"
            :disabled="!hasPendingTasks"
            @click="stopPendingTasks"
          >
            <fa icon="hand-paper" class="mr-1" />
            {{ $t('indexing.stopPendingTasks') }}
          </b-btn>
          <b-btn
            class="task-analysis-list__actions__delete-done-tasks"
            variant="outline-primary"
            :disabled="!hasDoneTasks"
            @click="deleteDoneTasks"
          >
            <fa icon="trash-alt" class="mr-1" />
            {{ $t('indexing.deleteDoneTasks') }}
          </b-btn>
        </b-btn-group>

        <div class="ml-auto">
          <b-btn v-b-modal:[extractingFormId] variant="primary" class="mr-2 task-analysis-list__actions__extract">
            <fa icon="search-plus" class="mr-2" />
            {{ $t('indexing.extractText') }}
          </b-btn>
          <b-btn
            v-b-tooltip
            v-b-modal:[findNamedEntitiesFormId]
            variant="primary"
            class="task-analysis-list__actions__find-named-entites mr-2"
            :title="$t('indexing.findNamedEntitiesTooltip')"
          >
            <fa icon="user-tag" class="mr-2" />
            {{ $t('indexing.findNamedEntities') }}
          </b-btn>

          <b-modal
            :id="extractingFormId"
            body-bg-variant="darker"
            hide-footer
            modal-class="task-analysis-list__form-modal extracting__form"
            size="md"
          >
            <template #modal-title>
              <fa icon="search-plus" class="mr-1" />
              {{ $t('indexing.extractText') }}
            </template>
            <extracting-form id="extracting-form" dark @submit="closeExtractingForm" />
          </b-modal>
          <b-modal
            :id="findNamedEntitiesFormId"
            body-bg-variant="darker"
            hide-footer
            modal-class="task-analysis-list__form-modal find-named-entities__form"
            size="md"
          >
            <template #modal-title>
              <fa icon="user-tag" class="mr-1" />
              {{ $t('indexing.findNamedEntities') }}
            </template>
            <find-named-entities-form id="find-named-entities-form" dark @submit="closeFindNamedEntitiesForm" />
          </b-modal>
        </div>
      </div>
      <v-wait for="load task-analysis-list tasks">
        <tasks-list :tasks="sortedTasks" stoppable>
          <template #empty>
            <p class="text-center m-0" v-html="$t('indexing.empty', { howToLink })"></p>
          </template>
        </tasks-list>
      </v-wait>
    </div>
  </div>
</template>

<script>
import { filter, random, sortBy, uniqueId } from 'lodash'
import { mapState } from 'vuex'

import ExtractingForm from '@/components/ExtractingForm'
import FindNamedEntitiesForm from '@/components/FindNamedEntitiesForm'
import TasksList from '@/components/TasksList'
import polling from '@/mixins/polling'
import settings from '@/utils/settings'
import { getOS } from '@/utils/utils'

export default {
  name: 'TaskAnalysisList',
  components: {
    ExtractingForm,
    FindNamedEntitiesForm,
    TasksList
  },
  mixins: [polling],
  data() {
    return {
      count: 0
    }
  },
  computed: {
    ...mapState('indexing', ['tasks']),
    hasIndexedDocuments() {
      return this.count > 0
    },
    hasPendingTasks() {
      return this.pendingTasks.length !== 0
    },
    hasDoneTasks() {
      return this.tasks.length - this.pendingTasks.length > 0
    },
    pendingTasks() {
      return filter(this.tasks, { state: 'RUNNING' })
    },
    sortedTasks() {
      // Move running tasks on top
      const states = ['RUNNING']
      return sortBy(this.tasks, ({ state }) => -states.indexOf(state))
    },
    extractingFormId() {
      return uniqueId('extracting-form-')
    },
    findNamedEntitiesFormId() {
      return uniqueId('find-named-entities-form-')
    },
    howToLink() {
      const os = getOS()
      const fallback = settings.documentationLinks.indexing.default
      return settings.documentationLinks.indexing[os] || fallback
    },
    indices() {
      return this.$store.state.search.indices
    }
  },
  async mounted() {
    this.$wait.start('load task-analysis-list tasks')
    this.count = await this.countAny()
    await this.startPollingTasks()
    if (this.count === 0 && this.tasks.length === 0) {
      this.$bvModal.show(this.extractingFormId)
    }
    this.$wait.end('load task-analysis-list tasks')
  },
  methods: {
    async countAny() {
      const index = this.indices.join(',')
      const preference = 'indexing'
      const { count = 0 } = await this.$core.api.elasticsearch.count({ index, preference })
      return count
    },
    closeExtractingForm() {
      this.$bvModal.hide(this.extractingFormId)
      return this.startPollingTasks()
    },
    closeFindNamedEntitiesForm() {
      this.$bvModal.hide(this.findNamedEntitiesFormId)
      return this.startPollingTasks()
    },
    async stopPendingTasks() {
      await this.$store.dispatch('indexing/stopPendingTasks')
      await this.$store.dispatch('indexing/getTasks')
    },
    async deleteDoneTasks() {
      await this.$store.dispatch('indexing/deleteDoneTasks')
      await this.$store.dispatch('indexing/getTasks')
    },
    startPollingTasks() {
      const fn = this.getTasks
      const timeout = () => random(1000, 4000)
      // Register the `getTasks` for later
      this.registerPollOnce({ fn, timeout })
      // Execute the `getTasks` method immediatly
      return fn()
    },
    async getTasks() {
      await this.$store.dispatch('indexing/getTasks')
      // Continue to poll task if they are pending ones
      return this.hasPendingTasks
    }
  }
}
</script>

<style lang="scss">
.task-analysis-list {
  &__table td {
    vertical-align: middle;
  }
}
</style>
