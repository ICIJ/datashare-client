<template>
  <div class="batch-download mt-4 container">
    <v-wait for="load download tasks">
      <tasks-list :tasks="tasks">
        <template v-slot="{ name }">
          <a
          :href="fetchDownloadResults(name)"
          target="_blank">
          <fa icon="download" fixed-width></fa>
            {{ cleanName(name) }}
          </a>
        </template>
      </tasks-list>
    </v-wait>
  </div>
</template>

<script>
import TasksList from '@/components/TasksList'
import Api from '@/api'

export default {
  name: 'BatchDownload',
  components: {
    TasksList
  },
  data () {
    return {
      tasks: []
    }
  },
  async mounted () {
    this.$wait.start('load download tasks')
    this.tasks = await this.getDownloadTasks()
    this.$wait.end('load download tasks')
  },
  methods: {
    async getDownloadTasks () {
      const api = new Api()
      return api.getTasks('BatchDownloadRunner')
    },
    fetchDownloadResults (name) {
      return `/api/task/${name}/result`
    },
    cleanName (name) {
      return name.split('.').pop().split('@').shift()
    }
  }
}
</script>

<style lang="scss">
</style>
