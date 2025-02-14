<script setup>
import TaskboardLatest from '@/views/Task/Taskboard/TaskboardLatest'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
</script>

<template>
  <page-header no-toggle-settings></page-header>
  <page-container fluid>
    <taskboard-latest />
  </page-container>
</template>

<style scoped lang="scss"></style>
