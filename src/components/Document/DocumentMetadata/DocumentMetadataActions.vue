<script setup>
import { HapticCopy } from '@icij/murmur-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BDropdownItemButton } from 'bootstrap-vue-next'

import IPhClipboard from '~icons/ph/clipboard'
import IPhMagnifyingGlass from '~icons/ph/magnifying-glass'
import IPhPushPin from '~icons/ph/push-pin'
import IPhPushPinFill from '~icons/ph/push-pin-fill'

import DocumentMetadataActionsEntry from './DocumentMetadataActionsEntry'
import AppDropdown from '@/components/AppDropdown/AppDropdown'

const pinned = defineModel('pinned', { type: Boolean })

const emit = defineEmits(['search'])

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  index: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  }
})
const { t } = useI18n()

const pinIcon = computed(() => (pinned.value ? IPhPushPinFill : IPhPushPin))
const pinIconHover = computed(() => IPhPushPinFill)
const q = computed(() => `${props.name}:"${props.value}"`)
const indices = computed(() => props.index)
</script>

<template>
  <div class="document-metadata-actions">
    <slot>
      <document-metadata-actions-entry
        class="document-metadata-actions__entry"
        :label="t('documentMetadataActions.search')"
        :to="{ name: 'search', query: { q, indices } }"
        :icon="IPhMagnifyingGlass"
        @click="emit('search')"
      />
      <app-dropdown
        class="document-metadata-actions__entry document-metadata-actions__entry--copy"
        button-icon-size="1.25em"
        :button-icon="IPhClipboard"
      >
        <haptic-copy
          :label="t('documentMetadataActions.copy')"
          :text="value"
          :tag="BDropdownItemButton"
          variant="link"
        />
        <haptic-copy
          :label="t('documentMetadataActions.copyKey')"
          :text="name"
          :tag="BDropdownItemButton"
          variant="link"
        />
        <haptic-copy
          :label="t('documentMetadataActions.copySearch')"
          :text="q"
          :tag="BDropdownItemButton"
          variant="link"
        />
      </app-dropdown>
      <document-metadata-actions-entry
        class="document-metadata-actions__entry"
        :label="t('documentMetadataActions.pin')"
        :icon="pinIcon"
        :icon-hover="pinIconHover"
        @click="pinned = !pinned"
      />
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.document-metadata-actions {
  display: inline-flex;
  gap: 2px;
}
</style>
