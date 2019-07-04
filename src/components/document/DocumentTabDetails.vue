<template>
  <div class="container-fluid py-3 document__content">
    <div class="row">
      <div class="col-8 document__content__details h-100">
        <h5>
          Details
        </h5>
        <p class="text-muted small">
          Those information are extraction from the document's metadata.
        </p>
        <div class="row document__content__details__item">
          <div class="col-sm-4 font-weight-bold">{{ $t('document.id') }}</div>
          <div class="col-sm-8 document__content__id">
            <div class="overflow-auto w-100 text-nowrap">
              <code>
                {{ document.id }}
              </code>
            </div>
          </div>
        </div>
        <div class="row document__content__details__item">
          <div class="col-sm-4 font-weight-bold">{{ $t('document.name') }}</div>
          <div class="col-sm-8 document__content__basename">{{ document.basename }}</div>
        </div>

        <div class="row document__content__details__item">
          <div class="col-sm-4 font-weight-bold">{{ $t('document.path') }}</div>
          <div class="col-sm-8 document__content__path">
            <div class="overflow-auto w-100 text-nowrap">
              {{ documentPath }}
            </div>
          </div>
        </div>

        <div class="row document__content__details__item">
          <div class="col-sm-4 font-weight-bold">{{ $t('document.creation_date') }}</div>
          <div class="col-sm-8 document__content__creation-date">{{ document.meta('creation_date') ? document.meta('creation_date') : $t('facet.missing') }}</div>
        </div>

        <div class="row document__content__details__item">
          <div class="col-sm-4 font-weight-bold">{{ $t('document.author') }}</div>
          <div class="col-sm-8 document__content__extraction-date">{{ document.meta('author') }}</div>
        </div>

        <div class="row document__content__details__item">
          <div class="col-sm-4 font-weight-bold">{{ $t('document.extraction_date') }}</div>
          <div class="col-sm-8 document__content__extraction-date">{{ document.source.extractionDate }}</div>
        </div>

        <div class="row document__content__details__item" v-if="document.source.contentLength !== -1">
          <div class="col-sm-4 font-weight-bold">{{ $t('document.size') }}</div>
          <div class="col-sm-8 document__content__size">{{ document.humanSize }}</div>
        </div>

        <div class="row document__content__details__item" v-if="document.source.language !== 'UNKNOWN'">
          <div class="col-sm-4 font-weight-bold">{{ $t('document.content_language') }}</div>
          <div class="col-sm-8">{{ $te(`facet.lang.${document.source.language}`) ? $t(`facet.lang.${document.source.language}`): document.source.language }}</div>
        </div>

        <div class="row document__content__details__item" v-if="document.source.contentType !== 'unknown'">
          <div class="col-sm-4 font-weight-bold">{{ $t('document.content_type') }}</div>
          <div class="col-sm-8 document__content__content-type">{{ getDocumentTypeLabel(document.source.contentType) }}</div>
        </div>

        <div class="row document__content__details__item" v-if="document.source.contentEncoding !== 'unknown'">
          <div class="col-sm-4 font-weight-bold">{{ $t('document.content_encoding') }}</div>
          <div class="col-sm-8">{{ document.source.contentEncoding }}</div>
        </div>

        <div class="row document__content__details__item" v-if="document.source.extractionLevel > 0">
          <div class="col-sm-4 font-weight-bold">{{ $t('facet.extraction-level') }}</div>
          <div class="col-sm-8 document__content__tree-level">{{ $t(getExtractionLevelTranslationKey(document.source.extractionLevel)) }}</div>
        </div>

        <div class="row document__content__details__item" v-if="document.source.extractionLevel > 0 && parentDocument">
          <div class="col-sm-4 font-weight-bold">{{ $t('document.parent_document') }}</div>
          <div class="col-sm-8">
            <router-link :to="{ name: 'document', params: { id: document.source.parentDocument, routing: document.routing } }" class="document__content__parent">
              {{ parentDocument.basename }}
            </router-link>
          </div>
        </div>

        <div class="row document__content__details__item" v-if="document.threadIndex">
          <div class="col-sm-4 font-weight-bold">{{ $t('document.thread_index') }}</div>
          <div class="col-sm-8">
            <router-link :to="{ name: 'search', query: { q: 'metadata.tika_metadata_message_raw_header_thread_index:' + document.threadIndex } }" class="document__content__parent">
              {{ document.threadIndex }}
            </router-link>
          </div>
        </div>

        <div class="row document__content__details__item" v-for="name in document.metas" :key="name" v-if="metadataVisible">
          <div class="col-sm-4 font-weight-bold">
            <div class="text-truncate" :title="name">
              <var>{{ document.shortMetaName(name) }}</var>
            </div>
          </div>
          <div class="col-sm-8">
            <div class="overflow-auto w-100 text-nowrap">
              {{ document.meta(name) }}
            </div>
          </div>
        </div>

        <div class="text-center mt-4">
          <button @click="metadataVisible = !metadataVisible" class="btn btn-outline-primary btn-sm">
            {{ $t(metadataVisible ? 'document.showLessDetails' : 'document.showMoreDetails') }}
          </button>
        </div>
      </div>

      <div class="col-4 border-left">
        <h5>
          {{ $t('document.tags') }}
        </h5>
        <p class="text-muted small">
          These tag are visible for all users.
        </p>

        <b-form @submit.prevent="submitTag" class="document__content__tags__add">
          <b-form-input id="new-tag" size="sm" v-model="tag" autofocus required placeholder="Add a new tag" />
        </b-form>

        <ul class="document__content__tags list-unstyled mt-3">
          <li class="document__content__tags__tag badge badge-light border badge-pill mr-2 mb-2" v-for="tag in document.tags" :key="tag">
            {{ tag }}
            <fa icon="times" class="document__content__tags__tag__delete fa-fw" @click="untag(tag)" />
          </li>
        </ul>
      </div>
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
      tag: '',
      metadataVisible: false
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
    async submitTag () {
      await this.$store.dispatch('document/tag', { documentId: this.document.id, routingId: this.document.routing, tags: [this.tag] })
      this.tag = ''
    },
    async untag (tag) {
      await this.$store.dispatch('document/untag', { documentId: this.document.id, routingId: this.document.routing, tags: [tag] })
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

  .document {

    &__content {

      &__details {

        &__item {
          padding: $spacer * 0.3 0;
        }

        &__item:nth-child(even) {
          background: #f3f3f3;
        }
      }

      &__tags__tag {
        font-size: 1rem;
        cursor: pointer;

        &__delete {
          font-size: 0.9rem;
          color: $text-muted;

          &:hover {
            color: $danger;
          }
        }

        &--hidden {
          display: none;
        }
      }
    }
  }

</style>
