<template>
  <div class="indexing">
    <div class="mt-4 container">
      <div class="mb-3 d-flex">
        <b-btn-group class="indexing__actions mr-2">
          <b-btn class="indexing__actions__stop-pending-tasks"
                 variant="outline-primary"
                 type="b-btn"
                 :disabled="!hasPendingTasks"
                 @click="stopPendingTasks">
            <fa icon="hand-paper" class="mr-1" />
            {{ $t('indexing.stopPendingTasks') }}
          </b-btn>
          <b-btn class="indexing__actions__delete-done-tasks"
                 variant="outline-primary"
                 :disabled="!hasDoneTasks"
                 @click="deleteDoneTasks">
            <fa icon="trash-alt" class="mr-1" />
            {{ $t('indexing.deleteDoneTasks') }}
          </b-btn>
        </b-btn-group>

        <div class="ml-auto">
          <b-btn variant="primary"
                 class="mr-2 indexing__actions__extract"
                 v-b-modal:[extractingFormId]>
            <fa icon="rocket" class="mr-2" />
            {{ $t('indexing.extractText') }}
          </b-btn>
          <b-btn variant="primary"
                 class="indexing__actions__find-named-entites mr-2"
                 :disabled="!canOpenFindNamedEntitiesForm"
                 :title="findNamedEntitiesTooltip"
                 v-b-tooltip
                 v-b-modal:[findNamedEntitiesFormId]>
            <fa icon="user-tag" class="mr-2" />
            {{ $t('indexing.findNamedEntities') }}
          </b-btn>

          <b-modal :id="extractingFormId"
                   body-bg-variant="darker"
                   hide-footer
                   modal-class="indexing__form-modal extracting__form"
                   size="md">
            <template #modal-title>
              <fa icon="rocket" class="mr-1"></fa>
              {{ $t('indexing.extractText') }}
            </template>
            <extracting-form id="extracting-form" :finally="closeExtractingForm" />
          </b-modal>
          <b-modal :id="findNamedEntitiesFormId"
                   body-bg-variant="darker"
                   hide-footer
                   modal-class="indexing__form-modal find-named-entities__form"
                   size="md">
            <template #modal-title>
              {{ $t('indexing.findNamedEntities') }}
            </template>
            <find-named-entities-form id="find-named-entities-form" :finally="closeFindNamedEntitiesForm" />
          </b-modal>
        </div>
      </div>
      <v-wait for="load indexing tasks">
        <div slot="waiting" class="card py-2">
          <content-placeholder class="py-2 px-3" v-for="index in 3" :key="index" />
        </div>
        <b-table :fields="tasksFields"
                 :items="sortedTasks"
                 responsive
                 striped
                 show-empty
                 thead-tr-class="text-nowrap"
                 tbody-tr-class="indexing__tasks__item"
                 class="card border-top-0 indexing__tasks">
          <template #empty>
            <p class="text-center m-0" v-html="$t('indexing.empty', { howToLink })"></p>
          </template>
          <template #cell(state)="{ item: { state, progress } }">
            <ellipse-status :status="state" :progress="progress * 100" horizontal />
          </template>
          <template #cell(name)="{ item: { state, name } }">
            <div class="indexing__tasks__item__name m-0 font-weight-bold">
              {{ name | taskToName }}
            </div>
            <div class="d-flex align-items-center">
              <b-badge variant="light" class="indexing__tasks__item__id my-1">
                {{ name | taskToId }}
              </b-badge>
              <template v-if="state === 'RUNNING'">
                <span class="px-1">
                  –
                </span>
                <b-btn variant="link" size="sm" @click="stopTask(name)" class="indexing__tasks__item__stop text-danger p-0">
                  Stop this task
                </b-btn>
              </template>
            </div>
          </template>
          <template #table-colgroup="{ fields }">
            <col v-for="{ key } in fields" :key="key" :style="{ width: key === 'state' ? '140px' : 'auto' }">
          </template>
        </b-table>
      </v-wait>
    </div>
  </div>
</template>

<script>
import { filter, random, sortBy, uniqueId } from 'lodash'
import { mapState } from 'vuex'

import ExtractingForm from '@/components/ExtractingForm'
import FindNamedEntitiesForm from '@/components/FindNamedEntitiesForm'
import EllipseStatus from '@/components/EllipseStatus'

import elasticsearch from '@/api/elasticsearch'
import polling from '@/mixins/polling'
import settings from '@/utils/settings'
import { getOS } from '@/utils/utils'

export default {
  name: 'indexing',
  components: {
    EllipseStatus,
    ExtractingForm,
    FindNamedEntitiesForm
  },
  mixins: [polling],
  filters: {
    taskToName (taskName) {
      return taskName.split('.').pop().split('@').shift()
    },
    taskToId (taskName) {
      return taskName.split('@').pop()
    }
  },
  data () {
    return {
      count: 0
    }
  },
  computed: {
    ...mapState('indexing', ['tasks']),
    hasIndexedDocuments () {
      return this.count > 0
    },
    hasPendingTasks () {
      return this.pendingTasks.length !== 0
    },
    hasDoneTasks () {
      return this.tasks.length - this.pendingTasks.length > 0
    },

    pendingTasks () {
      return filter(this.tasks, { state: 'RUNNING' })
    },
    sortedTasks () {
      // Move running tasks on top
      const states = ['RUNNING']
      return sortBy(this.tasks, ({ state }) => -states.indexOf(state))
    },
    extractingFormId () {
      return uniqueId('extracting-form-')
    },
    canOpenFindNamedEntitiesForm () {
      return this.hasDoneTasks || this.hasIndexedDocuments
    },
    findNamedEntitiesFormId () {
      return uniqueId('find-named-entities-form-')
    },
    findNamedEntitiesTooltip () {
      return !this.canOpenFindNamedEntitiesForm ? this.$t('indexing.findNamedEntitiesTooltip') : ''
    },
    howToLink () {
      const os = getOS()
      const fallback = settings.documentationLinks.indexing.default
      return settings.documentationLinks.indexing[os] || fallback
    },
    index () {
      return this.$store.state.search.index
    },
    tasksFields () {
      return this.tasks.length ? ['state', 'name'] : []
    }
  },
  async mounted () {
    this.$wait.start('load indexing tasks')
    this.count = await this.countAny()
    await this.startPollingTasks()
    if (this.count === 0 && this.tasks.length === 0) {
      this.$bvModal.show(this.extractingFormId)
    }
    this.$wait.end('load indexing tasks')
  },
  methods: {
    async countAny () {
      const index = this.index
      const preference = 'indexing'
      const { count = 0 } = await elasticsearch.count({ index, preference })
      return count
    },
    closeExtractingForm () {
      this.$bvModal.hide(this.extractingFormId)
      this.startPollingTasks()
    },
    closeFindNamedEntitiesForm () {
      this.$bvModal.hide(this.findNamedEntitiesFormId)
      this.startPollingTasks()
    },
    async stopPendingTasks () {
      await this.$store.dispatch('indexing/stopPendingTasks')
      await this.$store.dispatch('indexing/getTasks')
    },
    async stopTask (name) {
      await this.$store.dispatch('indexing/stopTask', name)
      await this.$store.dispatch('indexing/getTasks')
    },
    async deleteDoneTasks () {
      await this.$store.dispatch('indexing/deleteDoneTasks')
      await this.$store.dispatch('indexing/getTasks')
    },
    async startPollingTasks () {
      const fn = this.getTasks
      const immediate = true
      const timeout = () => random(1000, 4000)
      this.registerPollOnce({ fn, immediate, timeout })
    },
    async getTasks () {
      await this.$store.dispatch('indexing/getTasks')
      // Continue to poll task if they are pending ones
      return this.hasPendingTasks
    }
  }
}
</script>

<style lang="scss">
  .indexing {
    &__table td {
      vertical-align: middle;
    }
  }
</style>
