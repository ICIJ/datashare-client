<template>
  <div class="container-fluid py-3">
    <div class="row">
      <div class="col-sm-3 font-weight-bold">{{ $t('document.name') }}</div>
      <div class="col-sm-9 document__content__basename">{{ document.basename }}</div>
      <div class="col-sm-3 font-weight-bold">{{ $t('document.path') }}</div>
      <div class="col-sm-9 document__content__path">{{ documentPath }}</div>
      <div class="col-sm-3 font-weight-bold">{{ $t('document.id') }}</div>
      <div class="col-sm-9 document__content__id">{{ document.id }}</div>
      <div class="col-sm-3 font-weight-bold">{{ $t('document.creation_date') }}</div>
      <div class="col-sm-9 document__content__creation-date">{{ document.source.metadata.tika_metadata_creation_date ? document.creationDateHuman : $t('facet.missing') }}</div>
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
        <div class="col-sm-9 document__content__content-type">{{ getDocumentTypeLabel(document.source.contentType) }}</div>
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
      <template>
        <div class="col-sm-3 font-weight-bold">{{ $t('document.tags') }}</div>
        <div class="col-sm-9 document__content__tags">
          <div class="document__content__tags__tag" v-for="tag in document.tags" :key="tag">
            <fa icon="tag" class="fa-rotate-90 mr-2" />
            {{ tag }}
            <fa icon="times-circle" class="document__content__tags__tag__delete" @click="untag(tag)"/>
          </div>
          <b-form @submit.prevent="submitTag" class="document__content__tags__add w-50">
            <b-form-input id="new-tag" v-model="tag" required placeholder="New tag" />
          </b-form>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { getDocumentTypeLabel, getExtractionLevelTranslationKey } from '@/utils/utils'

export default {
  name: 'DocumentTabDetails',
  props: ['document', 'parentDocument'],
  data () {
    return {
      tag: ''
    }
  },
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
    getExtractionLevelTranslationKey,
    async untag (tag) {
      await this.$store.dispatch('document/untag', { documentId: this.document.id, tags: [tag] })
    },
    async submitTag () {
      await this.$store.dispatch('document/tag', { documentId: this.document.id, tags: [this.tag] }).then(() => {
        this.tag = ''
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .tab-pane {
    & div {
      word-wrap: break-word;
    }
  }

  .document__content__tags__tag {
    &:hover .document__content__tags__tag__delete {
      cursor: pointer;
      visibility: visible;
    }

    &__delete {
      visibility: hidden;
    }

    &--hidden {
      display: none;
    }
  }
</style>
