<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AppIcon } from '@icij/murmur-next'

import IPhHardDrives from '~icons/ph/hard-drives'
import IPhCloud from '~icons/ph/cloud'
import IPhDatabase from '~icons/ph/database'

defineOptions({ name: 'DisplayRepositoryType' })

const props = defineProps({
  value: {
    type: String,
    default: 'fs'
  }
})

const { t } = useI18n()

const typeIcon = computed(() => {
  const icons = {
    fs: IPhHardDrives,
    s3: IPhCloud,
    azure: IPhCloud,
    gcs: IPhCloud,
    hdfs: IPhDatabase,
    url: IPhCloud
  }
  return icons[props.value] ?? IPhDatabase
})

const typeLabel = computed(() => {
  return t(`display.repositoryType.${props.value}`, props.value)
})
</script>

<template>
  <span class="display-repository-type">
    <app-icon
      class="display-repository-type__icon"
    >
      <component :is="typeIcon" />
    </app-icon>
    <span class="display-repository-type__label">{{ typeLabel }}</span>
  </span>
</template>

<style lang="scss" scoped>
.display-repository-type {
  display: inline-flex;
  line-height: 1;
  align-items: baseline;
  gap: $spacer-xxs;

  &__icon {
    align-self: flex-start;
  }
}
</style>
