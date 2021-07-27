<template>
  <div class="tasks-list">
    <b-table :fields="tasksFields"
             :items="sortedTasks"
             responsive
             striped
             show-empty
             thead-tr-class="text-nowrap"
             tbody-tr-class="tasks-list__tasks__item"
             class="card border-top-0 indexing__tasks">
      <template #empty>
        <slot name="empty">
          <p class="text-center m-0" v-html="$t('tasksList.empty')"></p>
        </slot>
      </template>
      <template #cell(state)="{ item: { state, progress } }">
        <ellipse-status :status="state" :progress="progress * 100" horizontal />
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
            <span class="px-1">
              –
            </span>
            <b-btn variant="link" size="sm" @click="stopTask(item.name)" class="tasks-list__tasks__item__stop text-danger p-0">
              {{ $t('tasksList.stop') }}
            </b-btn>
          </template>
        </div>
      </template>
      <template #table-colgroup="{ fields }">
        <col v-for="{ key } in fields" :key="key" :style="{ width: key === 'state' ? '140px' : 'auto' }">
      </template>
    </b-table>
  </div>
</template>

<script>
import { sortBy } from 'lodash'
import EllipseStatus from '@/components/EllipseStatus'

export default {
  name: 'TasksList',
  components: {
    EllipseStatus
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
  filters: {
    taskToName (taskName) {
      return taskName.split('.').pop().split('@').shift()
    },
    taskToId (taskName) {
      return taskName.split('@').pop()
    }
  },
  computed: {
    sortedTasks () {
      // Move running tasks on top
      const states = ['RUNNING']
      return sortBy(this.tasks, ({ state }) => -states.indexOf(state))
    },
    tasksFields () {
      return this.tasks.length ? ['state', 'name'] : []
    }
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
    }
  }
}
</script>

<style lang="scss">
  .tasks-list {
    &__table td {
      vertical-align: middle;
    }
  }
</style>
