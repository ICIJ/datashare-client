<script setup>
import Fuse from 'fuse.js'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { property, orderBy } from 'lodash'

import DisplayContentLength from '@/components/Display/DisplayContentLength'
import DisplayContentType from '@/components/Display/DisplayContentType'
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import DisplayExtractionLevel from '@/components/Display/DisplayExtractionLevel'
import DisplayLanguage from '@/components/Display/DisplayLanguage'
import DisplayNumber from '@/components/Display/DisplayNumber'
import DocumentNotes from '@/components/Document/DocumentNotes'
import DocumentMetadata from '@/components/Document/DocumentMetadata/DocumentMetadata'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import ProjectLink from '@/components/Project/ProjectLink'
import DocumentViewTabsMetadataLinkedDocumentsCard from '@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadataLinkedDocumentsCard.vue'
import { useDocument } from '@/composables/useDocument'
import { useDebouncedRef } from '@/composables/useDebouncedRef'
import { useAppStore } from '@/store/modules'

const { document, documentPath, documentDirname, parentDocument } = useDocument()
const { t } = useI18n()
const q = useDebouncedRef('')
const appStore = useAppStore()

const canonicalItems = computed(() => [
  {
    name: '_id',
    label: t('document.id'),
    value: document.value.id
  },
  {
    name: '_index',
    label: t('document.project'),
    value: document.value.index,
    icon: 'circles-three-plus',
    component: ProjectLink,
    binding: {
      project: document.value.index
    }
  },
  {
    name: 'title',
    label: t('document.title'),
    icon: 'file-text',
    value: document.value.title
  },
  {
    name: 'path',
    label: t('document.path'),
    icon: 'tree-structure',
    value: documentPath.value
  },
  {
    name: 'dirname',
    label: t('document.dirname'),
    icon: 'folder',
    value: documentDirname.value
  },
  {
    name: 'metadata.tika_metadata_dcterms_created',
    label: t('document.creationDate'),
    icon: 'calendar',
    value: document.value.meta('dcterms_created'),
    component: DisplayDatetime
  },
  {
    name: 'metadata.tika_metadata_dc_creator',
    label: t('document.author'),
    icon: 'user-circle',
    value: document.value.meta('dc_creator')
  },
  {
    name: 'extractionDate',
    label: t('document.extractionDate'),
    icon: 'calendar',
    value: document.value.source.extractionDate,
    component: DisplayDatetime
  },
  {
    name: 'contentLength',
    label: t('document.size'),
    icon: 'floppy-disk-back',
    value: document.value.contentLength,
    component: DisplayContentLength
  },
  {
    name: 'metadata.tika_metadata_xmptpg_npages',
    label: t('document.numberOfPages'),
    icon: 'files',
    value: document.value.numberOfPages,
    component: DisplayNumber
  },
  {
    name: 'language',
    label: t('document.contentLanguage'),
    icon: 'globe-hemisphere-west',
    value: document.value.source.language,
    component: DisplayLanguage
  },
  {
    name: 'metadata.tika_metadata_content_type',
    label: t('document.contentType'),
    icon: 'file',
    value: document.value.source.contentType,
    component: DisplayContentType
  },
  {
    name: 'contentEncoding',
    label: t('document.contentEncoding'),
    value: document.value.source.contentEncoding
  },
  {
    name: 'extractionLevel',
    label: t('filter.extractionLevel'),
    icon: 'note-blank',
    value: document.value.source.extractionLevel,
    component: DisplayExtractionLevel
  },
  {
    name: 'metadata.tika_metadata_message_raw_header_thread_index',
    label: t('document.threadIndex'),
    icon: 'envelope',
    value: document.value.threadIndex
  },
  {
    name: 'parentDocument',
    label: t('document.parent'),
    icon: 'file',
    value: parentDocument?.value?.basename
  },
  {
    name: 'contentTextLength',
    label: t('document.contentTextLength'),
    icon: 'text-columns',
    value: document.value.source.contentTextLength,
    component: DisplayNumber
  }
])

const isCanonical = name => canonicalItems.value.map(property('name')).includes(name)

const metadataItems = computed(() => {
  return document.value.metadata
    .filter(name => !isCanonical(name) && !isCanonical(`metadata.${name}`))
    .map((name) => {
      const label = document.value.shortMetaName(name)
      const value = document.value.meta(name)
      return { label, name: `metadata.${name}`, value }
    })
})

const availableItems = computed(() => {
  // Merge canonical items with metadata items and only keep items with a value
  return [...canonicalItems.value, ...metadataItems.value].filter(property('value')).map((item) => {
    return { ...item, pinned: !!pinned.value[item.name] }
  })
})

const sortedItems = computed(() => orderBy(availableItems.value, ['pinned'], ['desc']))

const fuse = computed(() => {
  return new Fuse(sortedItems.value, {
    threshold: 0.1,
    shouldSort: false,
    keys: ['label', 'value']
  })
})

const items = computed(() => {
  if (q.value) {
    return fuse.value.search(q.value).map(property('item'))
  }
  return sortedItems.value
})

const pinning = ref(0)

const pinned = computed({
  get: () => appStore.getSettings('documentViewMetadata', 'pinned'),
  set: pinned => appStore.setSettings('documentViewMetadata', { pinned })
})

const pin = async (name, value) => {
  // To restrict transition to only moving items in the list when pinning elements,
  // we need to set a class on the parent element when pinning is happening. This
  // class will be removed after 500ms of no pinning activity.
  clearTimeout(pinning.value)
  pinning.value = setTimeout(() => (pinning.value = 0), 500)
  // Then simply update the pinned value
  pinned.value[name] = value
}

const classList = computed(() => {
  return {
    'document-view-tabs-metadata--pinning': pinning.value
  }
})
</script>

<template>
  <div
    class="document-view-tabs-metadata w-100 d-flex flex-column gap-3 pt-3"
    :class="classList"
  >
    <document-notes :document="document" />
    <document-view-tabs-metadata-linked-documents-card />
    <div class="bg-body py-3 sticky-top">
      <form-control-search
        v-model="q"
        :placeholder="t('documentViewTabsMetadata.search')"
        clear-text
        shadow
      />
    </div>
    <transition-group
      tag="div"
      name="list"
    >
      <document-metadata
        v-for="item in items"
        :key="item.name"
        :name="item.name"
        :index="document.index"
        :icon="item.icon"
        :label="item.label"
        :value="item.value"
        :pinned="!!pinned[item.name]"
        class="document-view-tabs-metadata__entry"
        @update:pinned="pin(item.name, $event)"
      >
        <component
          :is="item.component"
          v-if="item.component"
          v-bind="item.binding ?? { value: item.value }"
        />
      </document-metadata>
    </transition-group>
  </div>
</template>

<style lang="scss">
.document-view-tabs-metadata {
  &--pinning {
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
  }
}
</style>
