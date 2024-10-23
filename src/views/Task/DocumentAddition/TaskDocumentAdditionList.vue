<script setup>
import { computed, onMounted } from 'vue'
import { random } from 'lodash'
import { useStore } from 'vuex'

import TasksList from '@/components/TasksList'
import { getOS } from '@/utils/utils'
import settings from '@/utils/settings'
import { useCore } from '@/composables/core'
import { usePolling } from '@/composables/polling'
import PageHeader from '@/components/PageHeader/PageHeader'
import TasksActions from '@/views/Task/TasksActions'
import { useUtils } from '@/composables/utils'
import { useUrlParam, useUrlParamWithStore } from '@/composables/url-params'
const { core, wait } = useCore()
const { registerPollOnce } = usePolling()

const { isServer } = useUtils()
const store = useStore()
const searchQuery = useUrlParam('q', '')
const page = useUrlParam('page', {
  transform: (value) => parseInt(value),
  initialValue: 1
})
const perPage = useUrlParamWithStore('perPage', {
  transform: (value) => Math.max(10, parseInt(value)),
  get: () => core?.store.getters['app/getSettings']('taskList', 'perPage'),
  set: (value) => core?.store.commit('app/setSettings', { view: 'taskList', perPage: parseInt(value) })
})
const toAddRoute = computed(() => {
  return isServer.value ? null : { name: 'task.document-addition.new' }
})
const tasks = computed(() => store.getters['indexing/sortedTasks'])

onMounted(async () => {
  wait.start('load task-documentAddition-list tasks')
  try {
    await startPollingTasks()
  } finally {
    wait.end('load task-documentAddition-list tasks')
  }
})

const hasPendingTasks = computed(() => {
  return store.getters['indexing/hasPendingTasks']
})

async function getTasks() {
  await store.dispatch('indexing/getTasks')
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
<template>
  <page-header
    v-model:searchQuery="searchQuery"
    v-model:page="page"
    :per-page="perPage"
    :total-rows="50"
    :to-add="toAddRoute"
    searchable
    paginable
    :search-placeholder="$t('task.document-addition.list.searchPlaceholder')"
  >
    <template #end>
      <tasks-actions />
    </template>
  </page-header>
  <page-container fluid>
    <tasks-list :tasks="tasks">
      <template #empty>
        <p class="text-center m-0" v-html="$t('task.document-addition.list.empty', { howToLink })"></p>
      </template>
    </tasks-list>
  </page-container>
</template>
<style lang="scss">
.task-documentAddition-list {
  &__table td {
    vertical-align: middle;
  }
}
</style>
