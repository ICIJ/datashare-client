<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

const props = defineProps({
  /**
   * List of projects to use with the search link
   */
  projects: {
    type: Array,
    default: () => []
  },
  /**
   * Current path to use with the search link
   */
  path: {
    type: String
  }
})

const { t } = useI18n()

const to = computed(() => {
  const indices = props.projects.join(',')
  const query = { 'f[path]': props.path, indices }
  return { name: 'search', query }
})
</script>

<template>
  <button-icon
    :icon-left="PhMagnifyingGlass"
    :to="to"
    variant="link"
    hide-label
    :label="t('pathTreeViewEntrySearchLink.label')"
    class="path-tree-view-entry-search-link above-stretched-link"
  />
</template>
