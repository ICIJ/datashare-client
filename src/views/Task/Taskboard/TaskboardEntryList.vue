<script setup>
import TaskboardEntry from '@/views/Task/Taskboard/TaskboardEntry'
const taskEntries = [
  {
    title: 'Batch search',
    icon: 'list-magnifying-glass',
    description:
      'Get the results of each query of a list, all at once. For instance, instead of searching for all the politicians of your country one after the other, just upload the list and see the results for each one.',
    info: '13 shared batch searches, 0 private batch search',
    listLink: { name: 'task.batch-search.list' },
    actionLink: { name: 'task.batch-search.new' },
    actionText: 'Create a batch search'
  },
  {
    title: 'Batch downloads',
    icon: 'download-simple',
    description: 'When your query has results, you can download all of them in a password-protected file.',
    info: 'Batch search info',
    listLink: { name: 'task.batch-download.list' }
  },
  {
    title: 'Entity recognition',
    icon: 'users',
    description:
      'Know quickly what’s in your files by asking Datashare to automatically recognize names of people, locations and organizations in your documents, as well as email addresses. ',
    info: '3 entity recognitions',
    listLink: { name: 'task.entities.list' },
    actionLink: { name: 'task.entities.new' },
    actionText: 'Find entities'
  },
  {
    title: 'Document addition',
    icon: 'files',
    description:
      'Index documents that are on your computer or on a drive so you can search them in Datashare. Datashare can index all type of documents.',
    info: 'Batch search info',
    listLink: { name: 'task.documents.list' },
    actionLink: { name: 'task.documents.new' },
    actionText: 'Add documents'
  }
]
</script>

<template>
  <div class="taskboard-entry-list container-fluid bg-tertiary-subtle py-4">
    <div class="row g-3 justify-content-around flex-grow-1">
      <div v-for="(task, index) in taskEntries" :key="index" class="col-12 col-xl-5">
        <taskboard-entry v-bind="task" class="h-100 d-flex flex-column"> </taskboard-entry>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
