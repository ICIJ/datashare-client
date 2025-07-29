<script setup>
import { random } from 'lodash'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'
</script>

<template>
  <div class="d-flex flex-column gap-3">
    <app-placeholder height="2.875rem" />
    <app-placeholder
      v-for="j in 10"
      :key="j"
      :width="random(30, 70)"
    />
  </div>
</template>
