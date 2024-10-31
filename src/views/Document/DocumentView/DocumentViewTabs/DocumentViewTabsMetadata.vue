<script setup>
import Fuse from 'fuse.js'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { filter, map, property, orderBy } from 'lodash'

import ProjectLink from '@/components/Project/ProjectLink'
import DocumentMetadata from '@/components/Document/DocumentMetadata/DocumentMetadata'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import { getDocumentTypeLabel, getExtractionLevelTranslationKey } from '@/utils/utils'
import { useDocument } from '@/composables/document'

const { t } = useI18n()
const { document, documentPath, documentDirname, parentDocument } = useDocument()
const store = useStore()
const q = ref('')

const pinned = computed({
  get: () => store.getters['app/getSettings']('documentViewMetadata', 'pinned'),
  set: (pinned) => store.commit('app/setSettings', { view: 'documentViewMetadata', pinned })
})

const canonicalItems = computed(() => [
  {
    name: '_id',
    label: t('document.id'),
    classList: 'document-view-tabs-metadata__entry--id',
    value: document.value.id
  },
  {
    name: '_index',
    label: t('document.project'),
    classList: 'document-view-tabs-metadata__entry--project',
    value: document.value.index,
    icon: 'circles-three-plus',
    component: ProjectLink,
    componentBinding: {
      project: document.value.index
    }
  },
  {
    name: 'title',
    label: t('document.title'),
    classList: 'document-view-tabs-metadata__entry--title',
    icon: 'file-text',
    value: document.value.title
  },
  {
    name: 'path',
    label: t('document.path'),
    classList: 'document-view-tabs-metadata__entry--path',
    icon: 'tree-structure',
    value: documentPath.value
  },
  {
    name: 'dirname',
    label: t('document.dirname'),
    classList: 'document-view-tabs-metadata__entry--dirname',
    icon: 'folder',
    value: documentDirname.value
  },
  {
    name: 'metadata.tika_metadata_dcterms_created',
    label: t('document.creationDate'),
    classList: 'document-view-tabs-metadata__entry--creation-date',
    icon: 'calendar',
    value: document.value.meta('dcterms_created')
  },
  {
    name: 'metadata.tika_metadata_dc_creator',
    label: t('document.author'),
    classList: 'document-view-tabs-metadata__entry--author',
    icon: 'user-circle',
    value: document.value.meta('dc_creator')
  },
  {
    name: 'extractionDate',
    label: t('document.extractionDate'),
    classList: 'document-view-tabs-metadata__entry--extraction-date',
    icon: 'calendar',
    value: document.value.source.extractionDate
  },
  {
    name: 'contentLength',
    label: t('document.size'),
    classList: 'document-view-tabs-metadata__entry--content-length',
    icon: 'file',
    value: document.value.humanSize,
    rawValue: document.value.contentLength
  },
  {
    name: 'language',
    label: t('document.contentLanguage'),
    classList: 'document-view-tabs-metadata__entry--language',
    icon: 'globe-hemisphere-west',
    value: t(`filter.lang.${document.value.source.language}`),
    rawValue: document.value.source.language
  },
  {
    name: 'metadata.tika_metadata_content_type',
    label: t('document.contentType'),
    classList: 'document-view-tabs-metadata__entry--content-type',
    value: getDocumentTypeLabel(document.value.source.contentType),
    rawValue: document.value.source.contentType
  },
  {
    name: 'contentEncoding',
    label: t('document.contentEncoding'),
    classList: 'document-view-tabs-metadata__entry--content-encoding',
    value: document.value.source.contentEncoding
  },
  {
    name: 'extractionLevel',
    label: t('filter.extractionLevel'),
    classList: 'document-view-tabs-metadata__entry--tree-level',
    icon: 'note-blank',
    value: t(getExtractionLevelTranslationKey(document.value.source.extractionLevel)),
    rawValue: document.value.source.extractionLevel
  },
  {
    name: 'metadata.tika_metadata_message_raw_header_thread_index',
    label: t('document.threadIndex'),
    classList: 'document-view-tabs-metadata__entry--thread',
    icon: 'envelope',
    value: document.value.threadIndex
  },
  {
    name: 'parentDocument',
    label: t('document.parent'),
    classList: 'document-view-tabs-metadata__entry--parent',
    icon: 'file',
    value: parentDocument?.value?.basename
  },
  {
    name: 'contentTextLength',
    label: t('document.contentTextLength'),
    classList: 'document-view-tabs-metadata__entry--content-text-length',
    icon: 'text-columns',
    value: document.value.source.contentTextLength
  }
])

const canonicalItemsNames = computed(() => map(canonicalItems.value, 'name'))

const availableCanonicalItems = computed(() => filter(canonicalItems.value, (field) => field.value))

const metadataItemsNames = computed(() => {
  return filter(document.value.metas, (name) => {
    return !canonicalItemsNames.value.includes(`metadata.${name}`) && !canonicalItemsNames.value.includes(name)
  })
})

const metadataItems = computed(() => {
  return metadataItemsNames.value.map((name) => {
    const label = document.value.shortMetaName(name)
    const value = document.value.meta(name)
    return { label, name: `metadata.${name}`, value }
  })
})

const availableItems = computed(() => {
  return availableCanonicalItems.value.concat(metadataItems.value).map((item) => {
    item.pinned = !!pinned.value[item.name]
    return item
  })
})

const sortedItems = computed(() => orderBy(availableItems.value, ['pinned'], ['desc']))

const fuse = computed(() => {
  return new Fuse(sortedItems.value, {
    distance: 1,
    shouldSort: false,
    keys: ['label', 'name', 'value']
  })
})

const items = computed(() => {
  if (q.value) {
    return fuse.value.search(q.value).map(property('item'))
  } else {
    return sortedItems.value
  }
})
</script>

<template>
  <div class="document-view-tabs-metadata w-100 d-flex flex-column gap-3">
    <form-control-search v-model="q" placeholder="Search in metadata" clear-text />
    <transition-group tag="div" name="list">
      <document-metadata
        v-for="item in items"
        :key="item.name"
        :name="item.label"
        :icon="item.icon"
        :label="item.name"
        :value="item.value"
        :description="item.description"
        :class="item.classList"
        :pinned="!!pinned[item.name]"
        class="document-view-tabs-metadata__entry"
        @update:pinned="pinned[item.name] = $event"
      >
        <component :is="item.component" v-if="item.component" v-bind="item.componentBinding" />
      </document-metadata>
    </transition-group>
  </div>
</template>

<style>
.list-move {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
}

.list-leave-active {
  position: absolute;
}
</style>
