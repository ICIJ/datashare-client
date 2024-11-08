<script setup>
import Task from '@/views/Task/Task'
</script>
<template>
  <task
    :task-filter="['org.icij.datashare.tasks.EnqueueFromIndexTask', 'org.icij.datashare.tasks.ScanTask']"
    page-name="documents"
  />
</template>
