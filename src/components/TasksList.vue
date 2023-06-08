<template>
  <div class="tasks-list">
    <b-table
      :fields="tasksFields"
      :items="sortedTasks"
      responsive
      striped
      show-empty
      thead-tr-class="text-nowrap"
      tbody-tr-class="tasks-list__tasks__item"
      class="card border-top-0 tasks-list__tasks"
    >
      <template #empty>
        <slot name="empty">
          <p class="text-center m-0" v-html="$t('tasksList.empty')"></p>
        </slot>
      </template>
      <template #cell(state)="{ item }">
        <slot name="status" v-bind="{ item }">
          <ellipse-status :status="item.state" :progress="item.progress * 100" horizontal />
        </slot>
      </template>
      <template #cell(name)="{ item }">
        <div class="tasks-list__tasks__item__name m-0 font-weight-bold">
          <slot v-bind="{ item }">
            {{ item.name | taskToName }}
          </slot>
        </div>
        <div class="d-flex align-items-center">
          <b-badge variant="light" class="tasks-list__tasks__item__id my-1">
            {{ item.name | taskToId }}
          </b-badge>
          <template v-if="item.state === 'RUNNING' && stoppable">
            <span class="px-1"> – </span>
            <b-btn
              variant="link"
              size="sm"
              class="tasks-list__tasks__item__stop text-danger p-0"
              @click="stopTask(item.name)"
            >
              {{ $t('tasksList.stop') }}
            </b-btn>
          </template>
        </div>
        <div v-if="isBatchDownloadEncrypted(item)" class="font-italic tasks-list__tasks__item__encrypted">
          {{ $t('tasksList.encrypted') }}
        </div>
        <div v-if="hasZipSize(item)" class="tasks-list__tasks__item__size m-0 font-weight-bold">
          {{ humanSize(item.properties.batchDownload.zipSize, false, $t('human.size')) | taskToId }}
        </div>
      </template>
      <template #table-colgroup="{ fields }">
        <col v-for="{ key } in fields" :key="key" :style="{ width: key === 'state' ? '140px' : 'auto' }" />
      </template>
    </b-table>
  </div>
</template>

<script>
import { sortBy } from 'lodash'

import EllipseStatus from '@/components/EllipseStatus'
import humanSize from '@/filters/humanSize'

export default {
  name: 'TasksList',
  components: {
    EllipseStatus
  },
  filters: {
    taskToName(taskName) {
      return taskName.split('.').pop().split('@').shift()
    },
    taskToId(taskName) {
      return taskName.split('@').pop()
    }
  },
  props: {
    /**
     * Object of tasks passed from the parent
     */
    tasks: {
      type: Array
    },
    /**
     * Display a button to stop the task
     */
    stoppable: {
      type: Boolean
    }
  },
  computed: {
    sortedTasks() {
      // Move running tasks on top
      const states = ['RUNNING']
      return sortBy(this.tasks, ({ state }) => -states.indexOf(state))
    },
    tasksFields() {
      return this.tasks.length ? ['state', 'name'] : []
    },
    isZipEncrypted() {
      return this.$config.get('batchDownloadEncrypt')
    }
  },
  methods: {
    isBatchDownloadEncrypted(item) {
      return item.name.includes('BatchDownload') && item.properties.batchDownload.encrypted
    },
    hasZipSize(item) {
      return (
        item.name.includes('BatchDownload') &&
        item.state !== 'ERROR' &&
        item.properties.batchDownload.zipSize !== undefined
      )
    },
    async stopPendingTasks() {
      await this.$store.dispatch('indexing/stopPendingTasks')
      await this.$store.dispatch('indexing/getTasks')
    },
    async stopTask(name) {
      await this.$store.dispatch('indexing/stopTask', name)
      await this.$store.dispatch('indexing/getTasks')
    },
    async deleteDoneTasks() {
      await this.$store.dispatch('indexing/deleteDoneTasks')
      await this.$store.dispatch('indexing/getTasks')
    },
    humanSize
  }
}
</script>
