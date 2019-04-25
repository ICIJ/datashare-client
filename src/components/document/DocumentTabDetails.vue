<template>
  <div class="row">
    <div class="col-sm-3 font-weight-bold">{{ $t('document.name') }}</div>
    <div class="col-sm-9 document__content__basename">{{ document.basename }}</div>
    <div class="col-sm-3 font-weight-bold">{{ $t('document.path') }}</div>
    <div class="col-sm-9 document__content__path">{{ documentPath }}</div>
    <div class="col-sm-3 font-weight-bold">{{ $t('document.id') }}</div>
    <div class="col-sm-9 document__content__id">{{ document.id }}</div>
    <template v-if="document.source.metadata.tika_metadata_creation_date">
      <div class="col-sm-3 font-weight-bold">{{ $t('document.creation_date') }}</div>
      <div class="col-sm-9 document__content__creation-date">{{ document.creationDateHuman }}</div>
    </template>
    <template v-if="document.source.contentLength !== -1">
      <div class="col-sm-3 font-weight-bold">{{ $t('document.size') }}</div>
      <div class="col-sm-9 document__content__size">{{ document.humanSize }}</div>
    </template>
    <template v-if="document.source.language !== 'UNKNOWN'">
      <div class="col-sm-3 font-weight-bold">{{ $t('document.content_language') }}</div>
      <div class="col-sm-9">{{ $te(`facet.lang.${document.source.language}`) ? $t(`facet.lang.${document.source.language}`): document.source.language }}</div>
    </template>
    <template v-if="document.source.contentType !== 'unknown'">
      <div class="col-sm-3 font-weight-bold">{{ $t('document.content_type') }}</div>
      <div class="col-sm-9">{{ getDocumentTypeLabel(document.source.contentType) }}</div>
    </template>
    <template v-if="document.source.contentEncoding !== 'unknown'">
      <div class="col-sm-3 font-weight-bold">{{ $t('document.content_encoding') }}</div>
      <div class="col-sm-9">{{ document.source.contentEncoding }}</div>
    </template>
    <template v-if="document.source.extractionLevel > 0">
      <div class="col-sm-3 font-weight-bold">{{ $t('facet.extraction-level') }}</div>
      <div class="col-sm-9 document__content__tree-level">{{ $t(getExtractionLevelTranslationKey(document.source.extractionLevel)) }}</div>
    </template>
    <template v-if="document.source.extractionLevel > 0 && parentDocument">
      <div class="col-sm-3 font-weight-bold">{{ $t('document.parent_document') }}</div>
      <div class="col-sm-9">
        <router-link :to="{ name: 'document', params: { id: document.source.parentDocument, routing: document.routing } }" class="document__content__parent">
          {{ parentDocument.basename }}
        </router-link>
      </div>
    </template>
    <template v-if="document.threadIndex">
      <div class="col-sm-3 font-weight-bold">{{ $t('document.thread_index') }}</div>
      <div class="col-sm-9">
        <router-link :to="{ name: 'search', query: { q: 'metadata.tika_metadata_message_raw_header_thread_index:' + document.threadIndex } }" class="document__content__parent">
          {{ document.threadIndex }}
        </router-link>
      </div>
    </template>
  </div>
</template>

<script>
import { getDocumentTypeLabel, getExtractionLevelTranslationKey } from '@/utils/utils'

export default {
  name: 'DocumentTabDetails',
  props: ['document', 'parentDocument'],
  computed: {
    documentPath () {
      if (this.$config.get('mountedDataDir')) {
        return this.document.source.path.replace(this.$config.get('dataDir'), this.$config.get('mountedDataDir'))
      }
      return this.document.source.path
    }
  },
  methods: {
    getDocumentTypeLabel,
    getExtractionLevelTranslationKey
  }
}
</script>

<style lang="scss" scoped>
  .tab-pane {
    & div {
      word-wrap: break-word;
    }
  }
</style>
