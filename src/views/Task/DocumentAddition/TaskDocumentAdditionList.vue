<script setup>
import { computed, onMounted } from 'vue'
import { orderBy as orderArrayBy, property, random } from 'lodash'
import { useStore } from 'vuex'
import Fuse from 'fuse.js'

import TasksList from '@/components/TasksList'
import { getOS } from '@/utils/utils'
import settings from '@/utils/settings'
import { useCore } from '@/composables/core'
import { usePolling } from '@/composables/polling'
import PageHeader from '@/components/PageHeader/PageHeader'
import TasksActions from '@/views/Task/TasksActions'
import { useUtils } from '@/composables/utils'
import { useUrlParam, useUrlParamsWithStore, useUrlParamWithStore } from '@/composables/url-params'

const { core, wait } = useCore()
const { registerPollOnce } = usePolling()

const { isServer } = useUtils()
const store = useStore()

const toAddRoute = computed(() => {
  return isServer.value ? null : { name: 'task.document-addition.new' }
})
const viewKey = 'taskList'
const searchQuery = useUrlParam('q', '')
const page = useUrlParam('page', {
  transform: (value) => parseInt(value),
  initialValue: 1
})
const perPage = useUrlParamWithStore('perPage', {
  transform: (value) => Math.max(10, parseInt(value)),
  get: () => core?.store.getters['app/getSettings'](viewKey, 'perPage'),
  set: (value) => core?.store.commit('app/setSettings', { view: viewKey, perPage: parseInt(value) })
})

const orderBy = useUrlParamsWithStore(['sort', 'order'], {
  get: () => core?.store.getters['app/getSettings'](viewKey, 'orderBy'),
  set: (sort, order) => core?.store.commit('app/setSettings', { view: viewKey, orderBy: [sort, order] })
})
const originalTasks = computed(() => store.state.indexing.tasks)

const fuse = computed(() => {
  const keys = ['name', 'id']
  const options = { shouldSort: false, keys }
  return new Fuse(originalTasks.value, options)
})
const filteredTasks = computed(() => {
  if (searchQuery.value) {
    return fuse.value.search(searchQuery.value).map(property('item'))
  }
  return originalTasks.value
})
const sortedTasks = computed(() => {
  const [sort, order] = orderBy.value
  return orderArrayBy(filteredTasks.value, sort, order)
})
const tasks = computed(() => {
  const start = (page.value - 1) * perPage.value
  return sortedTasks.value?.slice(start, start + perPage.value)
})

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
    :total-rows="filteredTasks.length"
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
