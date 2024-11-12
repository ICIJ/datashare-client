<script setup>
import Task from '@/views/Task/Task'
</script>
<template>
  <task :task-filter="['org.icij.datashare.tasks.ExtractNlpTask']" page-name="entities" />
</template>
