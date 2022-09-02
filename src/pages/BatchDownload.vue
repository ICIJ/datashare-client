<template>
  <div class="batch-download mt-4 container">
    <v-wait for="load download tasks">
      <div slot="waiting" class="card py-2">
        <content-placeholder class="py-2 px-3" v-for="index in 3" :key="index" />
      </div>
      <tasks-list :tasks="tasks">
        <template v-slot="{ item: { name, properties, state } }">
          <div class="d-flex batch-download__item" :id="'batch-download__item-' + properties.batchDownload.uuid">
            <a v-if="properties.batchDownload.exists" :href="downloadResultsUrl(name)" class="batch-download__link--enabled" target="_blank">
              <fa icon="download" fixed-width />
              {{ properties.batchDownload.filename | basename }}
            </a>
            <span v-else class="batch-download__link--disabled disabled" :title="$t('batchDownload.noFile')">
              <fa icon="times" fixed-width />
              {{ properties.batchDownload.filename | basename }}
            </span>
            <batch-download-actions
              class="ml-auto"
              :name="name"
              :state="state"
              :value="properties.batchDownload"
              @relaunched="getDownloadTasks"
              @deleted="getDownloadTasks" />
          </div>
        </template>
        <template #empty>
          <p class="text-center m-0" v-html="$t('batchDownload.empty')"></p>
        </template>
      </tasks-list>
    </v-wait>
  </div>
</template>

<script>
import { some, random } from 'lodash'
import BatchDownloadActions from '@/components/BatchDownloadActions'
import TasksList from '@/components/TasksList'
import features from '@/mixins/features'
import polling from '@/mixins/polling'
import Api from '@/api'

const api = new Api()

export default {
  name: 'BatchDownload',
  components: {
    BatchDownloadActions,
    TasksList
  },
  mixins: [features, polling],
  data () {
    return {
      tasks: []
    }
  },
  filters: {
    basename (str) {
      return str.split('/').pop()
    }
  },
  async mounted () {
    this.$wait.start('load download tasks')
    await this.startPollingDownloadTasks()
    this.$wait.end('load download tasks')
  },
  computed: {
    hasPendingBatchDownloadTasks () {
      const pendingStates = ['RUNNING', 'QUEUED']
      return some(this.tasks, ({ state }) => pendingStates.includes(state))
    }
  },
  methods: {
    startPollingDownloadTasks () {
      const fn = this.getDownloadTasks
      const timeout = () => random(1000, 4000)
      // Register the `getDownloadTasks` for later
      this.registerPollOnce({ fn, timeout })
      // Execute the `getDownloadTasks` method immediatly
      return fn()
    },
    async getDownloadTasks () {
      this.tasks = await api.getTasks('BatchDownloadRunner')
      this.sortByDateTime(this.tasks)
      // Return true if it has pending download tasks to tell the
      // polling function to continue to poll tasks.
      return this.hasPendingBatchDownloadTasks
    },
    sortByDateTime (tasks) {
      const dateRegExp = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/
      this.tasks.sort(function (a, b) {
        return new Date(b.properties.batchDownload.filename.match(dateRegExp)[0]) - new Date(a.properties.batchDownload.filename.match(dateRegExp)[0])
      })
    },
    downloadResultsUrl (name) {
      return `/api/task/${name}/result`
    },
    cleanName (name) {
      return name.split('.').pop().split('@').shift()
    }
  }
}
</script>
