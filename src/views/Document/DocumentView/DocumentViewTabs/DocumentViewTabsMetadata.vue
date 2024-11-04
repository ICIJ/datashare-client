<script setup>
import Fuse from 'fuse.js'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { property, orderBy } from 'lodash'

import ProjectLink from '@/components/Project/ProjectLink'
import DocumentMetadata from '@/components/Document/DocumentMetadata/DocumentMetadata'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import { getDocumentTypeLabel, getExtractionLevelTranslationKey } from '@/utils/utils'
import { useDocument } from '@/composables/document'
import { useDebouncedRef } from '@/composables/debounce'

const { document, documentPath, documentDirname, parentDocument } = useDocument()
const { t } = useI18n()
const q = useDebouncedRef('')
const store = useStore()

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
    value: document.value.meta('dcterms_created')
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
    value: document.value.source.extractionDate
  },
  {
    name: 'contentLength',
    label: t('document.size'),
    icon: 'file',
    value: document.value.humanSize,
    rawValue: document.value.contentLength
  },
  {
    name: 'language',
    label: t('document.contentLanguage'),
    icon: 'globe-hemisphere-west',
    value: t(`filter.lang.${document.value.source.language}`),
    rawValue: document.value.source.language
  },
  {
    name: 'metadata.tika_metadata_content_type',
    label: t('document.contentType'),
    value: getDocumentTypeLabel(document.value.source.contentType),
    rawValue: document.value.source.contentType
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
    value: t(getExtractionLevelTranslationKey(document.value.source.extractionLevel)),
    rawValue: document.value.source.extractionLevel
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
    value: document.value.source.contentTextLength
  }
])

const isCannonical = (name) => canonicalItems.value.map(property('name')).includes(name)

const metadataItems = computed(() => {
  return document.value.metadata
    .filter((name) => !isCannonical(name) && !isCannonical(`metadata.${name}`))
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
  get: () => store.getters['app/getSettings']('documentViewMetadata', 'pinned'),
  set: (pinned) => store.commit('app/setSettings', { view: 'documentViewMetadata', pinned })
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
  <div class="document-view-tabs-metadata w-100 d-flex flex-column gap-3" :class="classList">
    <form-control-search v-model="q" placeholder="Search in metadata" clear-text />
    <transition-group tag="div" name="list">
      <document-metadata
        v-for="item in items"
        :key="item.name"
        :name="item.label"
        :icon="item.icon"
        :label="item.label"
        :value="item.value"
        :pinned="!!pinned[item.name]"
        class="document-view-tabs-metadata__entry"
        @update:pinned="pin(item.name, $event)"
      >
        <component :is="item.component" v-if="item.component" v-bind="item.binding" />
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
