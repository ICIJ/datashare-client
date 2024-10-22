<template>
  <div class="task-analysis-list">
    <tasks-action-bar />
    <tasks-list :tasks="tasks">
      <template #empty>
        <p class="text-center m-0" v-html="$t('indexing.empty', { howToLink })"></p>
      </template>
    </tasks-list>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { random } from 'lodash'

import TasksList from '@/components/TasksList'
import { getOS } from '@/utils/utils'
import settings from '@/utils/settings'
import { useCore } from '@/composables/core'
import TasksActionBar from '@/views/Task/TasksActionBar'
import { usePolling } from '@/composables/polling'
const { core, wait } = useCore()
const { registerPollOnce } = usePolling()
const tasks = computed(() => core.store.getters['indexing/sortedTasks'])
onMounted(async () => {
  wait.start('load task-analysis-list tasks')
  try {
    await startPollingTasks()
  } finally {
    wait.end('load task-analysis-list tasks')
  }
})

const hasPendingTasks = computed(() => {
  return core.store.getters['indexing/hasPendingTasks']
})

async function getTasks() {
  await core.store.dispatch('indexing/getTasks')
  // Continue to poll task if they are pending ones
  return hasPendingTasks.value
}
function startPollingTasks() {
  const fn = getTasks
  const timeout = () => random(1000, 4000)
  // Register the `getTasks` for later
  registerPollOnce({ fn, timeout })
  // Execute the `getTasks` method immediately
  return fn()
}
const howToLink = computed(() => {
  const os = getOS()
  const fallback = settings.documentationLinks.indexing.default
  return settings.documentationLinks.indexing[os] || fallback
})
</script>

<style lang="scss">
.task-analysis-list {
  &__table td {
    vertical-align: middle;
  }
}
</style>
