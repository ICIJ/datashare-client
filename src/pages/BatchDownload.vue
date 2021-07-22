<template>
  <div class="batch-download">
    <div class="mt-4 container">
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
                 tbody-tr-class="batch-download__tasks__item"
                 class="card border-top-0 batch-download__tasks">
          <template #empty>
            <p class="text-center m-0" v-html="$t('batchDownload.empty', { howToLink })"></p>
          </template>
          <template #cell(state)="{ item: { state, progress } }">
            <ellipse-status :status="state" :progress="progress * 100" horizontal />
          </template>
          <template #cell(name)="{ item: { state, name } }">
            <div class="batch-download__tasks__item__name m-0 font-weight-bold">
              {{ name | taskToName }}
            </div>
            <div class="d-flex align-items-center">
              <b-badge variant="light" class="batch-download__tasks__item__id my-1">
                {{ name | taskToId }}
              </b-badge>
              <template v-if="state === 'RUNNING'">
                <span class="px-1">
                  –
                </span>
                <b-btn variant="link" size="sm" @click="stopTask(name)" class="batch-download__tasks__item__stop text-danger p-0">
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
import { filter, random, sortBy } from 'lodash'
import { mapState } from 'vuex'

import EllipseStatus from '@/components/EllipseStatus'

import polling from '@/mixins/polling'
import settings from '@/utils/settings'
import { getOS } from '@/utils/utils'

export default {
  name: 'BatchDownload',
  components: {
    EllipseStatus
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
    hasDownloads () {
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
    await this.startPollingTasks()
    this.$wait.end('load indexing tasks')
  },
  methods: {
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
    startPollingTasks () {
      const fn = this.getTasks
      const timeout = () => random(1000, 4000)
      // Register the `getTasks` for later
      this.registerPollOnce({ fn, timeout })
      // Execute the `getTasks` method immediatly
      return fn()
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
