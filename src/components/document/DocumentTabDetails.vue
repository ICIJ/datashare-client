<template>
  <div class="container-fluid py-3 document__content">
    <div class="document__content__tags">
      <h5>
        {{ $t('document.tags') }}
      </h5>
      <p class="text-muted">
        These tags are visible for all users.
      </p>
      <div class="row mb-3">
        <div class="col-md-4 mb-3">
          <b-form @submit.prevent="submitTag" class="document__content__tags__add">
            <b-form-input id="new-tag" size="sm" v-model="tag" autofocus required placeholder="Add a new tag" />
          </b-form>
        </div>
        <div class="col-md-8">
          <ul class="document__content__tags list-unstyled mb-0 mt-1">
            <li class="document__content__tags__tag badge badge-light border badge-pill mr-2 mb-1" v-for="tag in document.tags" :key="tag">
              {{ tag }}
              <fa icon="times" class="document__content__tags__tag__delete fa-fw" @click="untag(tag)" />
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="document__content__details">
      <h5>
        Details
      </h5>
      <p class="text-muted">
        These information are extracted from the document's metadata.
      </p>

      <div class="row document__content__details__item" v-for="field in canonicalFields" :key="field.name" v-if="field.value && field.value !== 'unknown'">
        <div class="col-sm-4 pr-0 font-weight-bold d-flex justify-content-between">
          <div class="text-truncate mr-1 w-100" :title="field.name">
            {{ field.label }}
          </div>
          <div class="mr-auto document__content__details__item__search">
            <router-link :to="{ name: 'search', query: { q: document.valueAsQueryParam(field.name, field.rawValue !== undefined ? field.rawValue : field.value) } }">
              <fa icon="search" />
            </router-link>
          </div>
        </div>
        <div class="col-sm-8">
          <div class="w-100 text-truncate" :class="field.class">
            <component :is="field.component || 'div'" :title="field.value">
              {{ field.value }}
            </component>
          </div>
        </div>
      </div>

      <div class="row document__content__details__item" v-for="name in metaFieldsNames" :key="name" v-if="metadataVisible" v-once>
        <div class="col-sm-4 pr-0 font-weight-bold d-flex justify-content-between">
          <div class="text-truncate mr-1 w-100" :title="name">
            <var>{{ document.shortMetaName(name) | startCase }}</var>
          </div>
          <div class="mr-auto document__content__details__item__search">
            <router-link :to="{ name: 'search', query: { q: document.metaAsQueryParam(name) } }">
              <fa icon="search" />
            </router-link>
          </div>
        </div>
        <div class="col-sm-8">
          <div class="w-100 text-truncate">
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
  </div>
</template>

<script>
import filter from 'lodash/filter'
import get from 'lodash/get'
import map from 'lodash/map'
import startCase from 'lodash/startCase'

import { getDocumentTypeLabel, getExtractionLevelTranslationKey } from '@/utils/utils'

export default {
  name: 'DocumentTabDetails',
  props: ['document', 'parentDocument'],
  filters: {
    startCase
  },
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
    },
    metaFieldsNames () {
      return filter(this.document.metas, name => {
        return map(this.canonicalFields, 'name').indexOf(name) === -1
      })
    },
    canonicalFields () {
      return [
        {
          name: '_id',
          label: this.$t('document.id'),
          class: 'document__content__id',
          value: this.document.id,
          component: 'code'
        },
        {
          name: 'name',
          label: this.$t('document.name'),
          class: 'document__content__basename',
          value: this.document.basename
        },
        {
          name: 'path',
          label: this.$t('document.path'),
          class: 'document__content__path',
          value: this.documentPath
        },
        {
          name: 'metadata.tika_metadata_creation_date',
          label: this.$t('document.creation_date'),
          class: 'document__content__creation-date',
          value: this.document.meta('creation_date')
        },
        {
          name: 'metadata.tika_metadata_author',
          label: this.$t('document.author'),
          class: 'document__content__author',
          value: this.document.meta('author')
        },
        {
          name: 'extractionDate',
          label: this.$t('document.extraction_date'),
          class: 'document__content__extraction-date',
          value: this.document.source.extractionDate
        },
        {
          name: 'contentLength',
          label: this.$t('document.size'),
          class: 'document__content__content-length',
          value: this.document.humanSize,
          rawValue: this.document.source.contentLength
        },
        {
          name: 'language',
          label: this.$t('document.content_language'),
          class: 'document__content__language',
          value: this.$t(`facet.lang.${this.document.source.language}`),
          rawValue: this.document.source.language
        },
        {
          name: 'contentType',
          label: this.$t('document.content_type'),
          class: 'document__content__content-type',
          value: this.getDocumentTypeLabel(this.document.source.contentType),
          rawValue: this.document.source.contentType
        },
        {
          name: 'contentEncoding',
          label: this.$t('document.content_encoding'),
          class: 'document__content__content-encoding',
          value: this.document.source.contentEncoding
        },
        {
          name: 'extractionLevel',
          label: this.$t('facet.extraction-level'),
          class: 'document__content__tree-level',
          value: this.$t(this.getExtractionLevelTranslationKey(this.document.source.extractionLevel)),
          rawValue: this.document.source.extractionLevel
        },
        {
          name: 'metadata.tika_metadata_message_raw_header_thread_index',
          label: this.$t('document.thread_index'),
          class: 'document__content__thread',
          value: this.document.threadIndex
        },
        {
          name: 'parentDocument',
          label: this.$t('document.parent'),
          class: 'document__content__parent',
          value: get(this, 'parentDocument.basename', null)
        }
      ]
    }
  },
  methods: {
    getDocumentTypeLabel,
    getExtractionLevelTranslationKey,
    async submitTag () {
      await this.$store.dispatch('document/tag', { documentId: this.document.id, routingId: this.document.routing, tags: [this.tag] })
      await this.$store.dispatch('document/get', { id: this.document.id, routing: this.document.routing })
      this.tag = ''
    },
    async untag (tag) {
      await this.$store.dispatch('document/untag', { documentId: this.document.id, routingId: this.document.routing, tags: [tag] })
      await this.$store.dispatch('document/get', { id: this.document.id, routing: this.document.routing })
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

          &__search {
            display: none;
          }

          &:hover &__search {
            display: block;
          }
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
