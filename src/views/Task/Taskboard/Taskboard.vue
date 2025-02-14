<script setup>
import TaskboardLatest from '@/views/Task/Taskboard/TaskboardLatest'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskboardEntryList from '@/views/Task/Taskboard/TaskboardEntryList'
</script>

<template>
  <page-header no-toggle-settings />
  <page-container fluid class="d-flex flex-column gap-3">
    <taskboard-latest />
    <taskboard-entry-list />
  </page-container>
</template>

<style scoped lang="scss"></style>
