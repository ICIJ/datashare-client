<script setup>
import { computed } from 'vue'
import { castArray, groupBy, property } from 'lodash'
import { useI18n } from 'vue-i18n'
import Fuse from 'fuse.js'

import DisplayRoute from '@/components/Display/DisplayRoute'
import PageHeader from '@/components/PageHeader/PageHeader'
import PageContainer from '@/components/PageContainer/PageContainer'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import KeyboardShortcutsSection from '@/components/KeyboardShortcuts/KeyboardShortcutsSection/KeyboardShortcutsSection'
import KeyboardShortcutsSectionEntry from '@/components/KeyboardShortcuts/KeyboardShortcutsSection/KeyboardShortcutsSectionEntry'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useUrlParam } from '@/composables/useUrlParam'

const searchQuery = useUrlParam('q', '')
const { t, te } = useI18n()

const { shortcuts } = useKeyboardShortcuts()

const extendedShortcuts = computed(() => {
  return shortcuts.value.map((shortcut) => {
    const labelI18n = te(shortcut.label) ? t(shortcut.label) : shortcut.label
    return { ...shortcut, labelI18n }
  })
})

const fuse = computed(() => {
  const keys = ['action', 'labelI18n']
  const options = { shouldSort: false, threshold: 0.1, keys }
  return new Fuse(extendedShortcuts.value, options)
})

const filteredShotcuts = computed(() => {
  if (searchQuery.value) {
    return fuse.value.search(searchQuery.value).map(property('item'))
  }
  return extendedShortcuts.value
})

const groupedShortcuts = computed(() => {
  return groupBy(filteredShotcuts.value, ({ route }) => {
    return castArray(route).shift()
  })
})
</script>

<template>
  <page-header no-toggle-settings />
  <page-container fluid>
    <div class="bg-tertiary-subtle rounded-1 pt-4 pb-5 px-5 d-flex flex-column gap-4">
      <form-control-search
        v-model="searchQuery"
        autofocus
        clear-text
        shadow
        :placeholder="$t('shortcutsView.searchPlaceholder')"
      />
      <keyboard-shortcuts-section
        v-for="(sectionShortcuts, route) in groupedShortcuts"
        :key="route"
        class="bg-body rounded p-4"
      >
        <template #title>
          <display-route :value="route" />
        </template>
        <keyboard-shortcuts-section-entry
          v-for="(shortcut, i) in sectionShortcuts"
          :key="i"
          :keys="shortcut.keys.default"
          :mac-keys="shortcut.keys.mac"
          :label="$t(shortcut.label)"
        />
      </keyboard-shortcuts-section>
    </div>
  </page-container>
</template>
