<script setup>
import { computed } from 'vue'

import PageHeader from '@/components/PageHeader/PageHeader'
import { useUtils } from '@/composables/utils'
import { useUrlParam, useUrlParamWithStore } from '@/composables/url-params'
import { useCore } from '@/composables/core'

defineOptions({ name: 'TaskAnalysis' })
const { core } = useCore()
const { isServer } = useUtils()

const searchQuery = useUrlParam('q', '')
const page = useUrlParam('page', {
  transform: (value) => parseInt(value),
  initialValue: 1
})
const perPage = useUrlParamWithStore('perPage', {
  transform: (value) => Math.max(10, parseInt(value)),
  get: () => core?.store.getters['app/getSettings']('taskList', 'perPage'),
  set: (value) => core?.store.commit('app/setSettings', { view: 'taskAnalysisList', perPage: parseInt(value) })
})
const toAddRoute = computed(() => {
  return isServer.value ? null : { name: 'task.analysis.new' }
})
/* const fuse = computed(() => {
  const keys = ['name', 'label']
  const options = { shouldSort: false, threshold: 0.1, keys }
  return new Fuse(tasks.value, options)
})
const filteredTasks = computed(() => {
  if (searchQuery.value) {
    return fuse.value.search(searchQuery.value).map(property('item'))
  }
  return tasks.value
}) */
</script>

<template>
  {{ $route.name }}
  <page-header
    v-model:searchQuery="searchQuery"
    v-model:page="page"
    :per-page="perPage"
    :total-rows="50"
    :to-add="toAddRoute"
    searchable
    paginable
    search-placeholder="Search analysis task"
  />
  <router-view />
</template>
