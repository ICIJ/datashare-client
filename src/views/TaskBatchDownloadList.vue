<template>
  <div class="task-batch-download-list mt-4 container">
    <v-wait for="load download tasks">
      <template #waiting>
        <div class="card py-2">
          <content-placeholder v-for="index in 3" :key="index" class="py-2 px-3" />
        </div>
      </template>
      <tasks-list :tasks="tasks">
        <template #status="{ item: { args, state, error } }">
          <task-item-status
            :task-item="{
              ...args.batchDownload,
              state,
              errorMessage: error,
              key: 'batchDownload'
            }"
          />
        </template>
        <template #default="{ item: { id, name, args, state } }">
          <div
            :id="'task-batch-download-list__item--' + args.batchDownload.uuid"
            class="d-flex task-batch-download-list__item"
          >
            <a
              v-if="args.batchDownload.exists"
              :href="downloadResultsUrl(id)"
              class="task-batch-download-list__item__link"
              target="_blank"
            >
              <fa icon="download" fixed-width />
              {{ basename(args.batchDownload.filename) }}
            </a>
            <span
              v-else
              v-b-tooltip
              class="task-batch-download-list__item__link task-batch-download-list__item__link--disabled"
              :title="$t('batchDownload.noFile')"
            >
              <fa icon="xmark" fixed-width />
              {{ basename(args.batchDownload.filename) }}
            </span>
            <batch-download-actions
              :id="id"
              class="ms-auto"
              :name="name"
              :state="state"
              :value="args.batchDownload"
              @relaunched="startPollingDownloadTasks"
              @deleted="getDownloadTasks"
            />
          </div>
        </template>
        <template #empty>
          <p class="text-center m-0" v-html="$t('batchDownload.empty')"></p>
        </template>
      </tasks-list>
      <p class="text-center m-0 text-muted" v-html="$t('batchDownload.limitations', batchDownloadLimitations)"></p>
    </v-wait>
  </div>
</template>

<script>
import { some, random } from 'lodash'

import TaskItemStatus from '@/components/TaskItemStatus'
import BatchDownloadActions from '@/components/BatchDownloadActions'
import TasksList from '@/components/TasksList'
import features from '@/mixins/features'
import polling from '@/mixins/polling'

function extractDateFromTask(task) {
  const dateRegExp = /\d{4}-[01]\d-[0-3]\dT[0-2]\d_[0-5]\d_[0-5]\d.\d+Z/
  return task?.args?.batchDownload?.filename?.match(dateRegExp)?.[0].replaceAll('_', ':') ?? null
}
export default {
  name: 'TaskBatchDownloadList',
  components: {
    BatchDownloadActions,
    TaskItemStatus,
    TasksList
  },
  mixins: [features, polling],
  data() {
    return {
      tasks: []
    }
  },
  computed: {
    hasPendingBatchDownloadTasks() {
      const pendingStates = ['RUNNING', 'QUEUED']
      return some(this.tasks, ({ state }) => pendingStates.includes(state))
    },
    batchDownloadLimitations() {
      return {
        maxNbFiles: this.$core.config.get('batchDownloadMaxNbFiles'),
        maxSize: this.$core.config.get('batchDownloadMaxSize')
      }
    }
  },
  async mounted() {
    this.$wait.start('load download tasks')
    await this.startPollingDownloadTasks()
    this.$wait.end('load download tasks')
  },
  methods: {
    basename(str) {
      return str.split('/').pop()
    },
    startPollingDownloadTasks() {
      const fn = this.getDownloadTasks
      const timeout = () => random(1000, 4000)
      // Register the `getDownloadTasks` for later
      this.registerPollOnce({ fn, timeout })
      // Execute the `getDownloadTasks` method immediatly
      return fn()
    },
    async getDownloadTasks() {
      try {
        const tasks = await this.$core.api.getTasks('BatchDownloadRunner')
        this.tasks = this.sortByDateTime(tasks)
      } catch (e) {
        // hot fix to prevent showing endless loading placeholders
        this.$wait.end('load download tasks')
      }

      // Return true if it has pending download tasks to tell the
      // polling function to continue to poll tasks.
      return this.hasPendingBatchDownloadTasks
    },
    sortByDateTime(tasks) {
      return tasks.sort(function (a, b) {
        return new Date(extractDateFromTask(b)) - new Date(extractDateFromTask(a))
      })
    },
    downloadResultsUrl(name) {
      return `/api/task/${name}/result`
    }
  }
}
</script>
