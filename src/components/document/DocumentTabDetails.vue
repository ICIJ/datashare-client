<template>
  <div class="container-fluid py-3 document__content">
    <div class="document__content__tags mb-3">
      <h5>
        {{ $t('document.tags') }}
      </h5>
      <p class="text-muted">
        {{ $t('document.tagsVisibility') }}
      </p>
      <document-tags-form :document="document" :tags="tags" :display-tags="true" :display-form="true" />
    </div>

    <div class="document__content__shortcuts mb-3">
      <h5 class="mb-3">
        {{ $t('document.shortcuts') }}
      </h5>
      <ul class="list-inline">
        <li class="document__content__shortcuts__children me-4 list-inline-item mb-3">
          <router-link :to="searchChildrenDocumentParams" class="btn btn-primary btn-sm">
            <fa icon="paperclip" class="me-2" />
            {{ $t('document.searchChildrenDocument') }}
          </router-link>
        </li>
        <li class="document__content__shortcuts__folder list-inline-item mb-3">
          <router-link :to="searchDirnameDocumentParams" class="btn btn-primary btn-sm">
            <fa icon="folder-open" class="me-2" />
            {{ $t('document.searchDirnameDocument') }}
          </router-link>
        </li>
      </ul>
    </div>

    <div class="document__content__details">
      <h5>
        {{ $t('document.details') }}
      </h5>
      <p class="text-muted">
        {{ $t('document.detailsInfo') }}
      </p>
      <b-table :items="items" :fields="fields" :tbody-tr-class="itemRowClass" responsive striped borderless>
        <template #cell(label)="{ item: { name, label, value } }">
          <div class="font-weight-bold d-flex justify-content-between">
            <div class="text-truncate me-1 w-100" :title="name">
              <var>{{ document.shortMetaName(label || name) | startCase }}</var>
            </div>
            <div class="ms-auto document__content__details__item__label__search">
              <router-link :to="{ name: 'search', query: { q: document.metaAsQueryParam(name, value), indices } }">
                <fa icon="search" />
              </router-link>
            </div>
          </div>
        </template>
        <template #cell(value)="{ item: field }">
          <component :is="field.component" v-if="field.component" v-bind="field.componentBinding" />
          <span v-else-if="field.value === 'unknown'" class="text-muted">
            {{ $t('document.unknown') }}
          </span>
          <b-input-group v-else size="sm" class="document__content__details__item__input-group">
            <b-input :value="field.value" readonly class="document__content__details__item__input-group__input" />
            <b-input-group-append>
              <haptic-copy
                class="btn btn-light document__content__details__item__input-group__copy"
                hide-label
                :text="String(field.value)"
                tooltip-placement="left"
              />
            </b-input-group-append>
          </b-input-group>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import { filter, get, map, startCase, uniq } from 'lodash'
import { mapState } from 'vuex'

import DocumentTagsForm from '@/components/DocumentTagsForm'
import ProjectLink from '@/components/ProjectLink'
import { getDocumentTypeLabel, getExtractionLevelTranslationKey } from '@/utils/utils'

/**
 * A panel displaying details and metadata about an indexed document.
 */
export default {
  name: 'DocumentTabDetails',
  components: {
    DocumentTagsForm,
    ProjectLink
  },
  filters: {
    startCase
  },
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object,
      required: true
    },
    /**
     * The parent document (if any)
     */
    parentDocument: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    ...mapState('document', ['tags']),
    documentPath() {
      if (this.$config.get('mountedDataDir')) {
        return this.document.source.path.replace(this.$config.get('dataDir'), this.$config.get('mountedDataDir'))
      } else {
        return this.document.source.path
      }
    },
    documentDirname() {
      if (this.$config.get('mountedDataDir')) {
        return this.document.source.dirname.replace(this.$config.get('dataDir'), this.$config.get('mountedDataDir'))
      } else {
        return this.document.source.dirname
      }
    },
    index() {
      return this.document.index
    },
    indices() {
      return uniq([this.index, ...this.$store.state.search.indices]).join(',')
    },
    fields() {
      return [
        {
          key: 'label',
          sortable: true,
          tdClass: 'align-middle document__content__details__item__label'
        },
        {
          key: 'value',
          tdClass: 'align-middle document__content__details__item__value'
        }
      ]
    },
    items() {
      return this.presentCanonicalItems.concat(this.metaItems)
    },
    metaItems() {
      return this.metaItemsNames.map((name) => {
        const label = this.document.shortMetaName(name)
        const value = this.document.meta(name)
        return { label, name, value }
      })
    },
    metaItemsNames() {
      return filter(this.document.metas, (name) => {
        return !this.canonicalItemsNames.includes(`metadata.${name}`) && !this.canonicalItemsNames.includes(name)
      })
    },
    canonicalItems() {
      return [
        {
          name: '_id',
          label: this.$t('document.id'),
          trClass: 'document__content__id',
          value: this.document.id
        },
        {
          name: '_index',
          label: this.$t('document.project'),
          trClass: 'document__content__project',
          value: this.document.index,
          component: ProjectLink,
          componentBinding: {
            project: this.document.index
          }
        },
        {
          name: 'title',
          label: this.$t('document.title'),
          trClass: 'document__content__title',
          value: this.document.title
        },
        {
          name: 'path',
          label: this.$t('document.path'),
          trClass: 'document__content__path',
          value: this.documentPath
        },
        {
          name: 'dirname',
          label: this.$t('document.dirname'),
          trClass: 'document__content__dirname',
          value: this.documentDirname
        },
        {
          name: 'tika_metadata_resourcename',
          label: this.$t('document.name'),
          trClass: 'document__content__basename',
          value: this.document.meta('resourcename')
        },
        {
          name: 'tika_metadata_dcterms_created',
          label: this.$t('document.creationDate'),
          trClass: 'document__content__creation-date',
          value: this.document.meta('dcterms_created')
        },
        {
          name: 'tika_metadata_dc_creator',
          label: this.$t('document.author'),
          trClass: 'document__content__author',
          value: this.document.meta('dc_creator')
        },
        {
          name: 'extractionDate',
          label: this.$t('document.extractionDate'),
          trClass: 'document__content__extraction-date',
          value: this.document.source.extractionDate
        },
        {
          name: 'contentLength',
          label: this.$t('document.size'),
          trClass: 'document__content__content-length',
          value: this.document.humanSize,
          rawValue: this.document.contentLength
        },
        {
          name: 'language',
          label: this.$t('document.contentLanguage'),
          trClass: 'document__content__language',
          value: this.$t(`filter.lang.${this.document.source.language}`),
          rawValue: this.document.source.language
        },
        {
          name: 'tika_metadata_content_type',
          label: this.$t('document.contentType'),
          trClass: 'document__content__content-type',
          value: this.getDocumentTypeLabel(this.document.source.contentType),
          rawValue: this.document.source.contentType
        },
        {
          name: 'contentEncoding',
          label: this.$t('document.contentEncoding'),
          trClass: 'document__content__content-encoding',
          value: this.document.source.contentEncoding
        },
        {
          name: 'extractionLevel',
          label: this.$t('filter.extractionLevel'),
          trClass: 'document__content__tree-level',
          value: this.$t(this.getExtractionLevelTranslationKey(this.document.source.extractionLevel)),
          rawValue: this.document.source.extractionLevel
        },
        {
          name: 'tika_metadata_message_raw_header_thread_index',
          label: this.$t('document.threadIndex'),
          trClass: 'document__content__thread',
          value: this.document.threadIndex
        },
        {
          name: 'parentDocument',
          label: this.$t('document.parent'),
          trClass: 'document__content__parent',
          value: get(this, 'parentDocument.basename', null)
        },
        {
          name: 'contentTextLength',
          label: this.$t('document.contentTextLength'),
          trClass: 'document__content__content-text-length',
          value: this.document.source.contentTextLength
        }
      ]
    },
    canonicalItemsNames() {
      return map(this.canonicalItems, 'name')
    },
    presentCanonicalItems() {
      return filter(this.canonicalItems, (field) => field.value)
    },
    searchChildrenDocumentParams() {
      const index = this.index
      const q = `_routing:${this.document.id}`
      const query = { q, index }
      return { name: 'search', query }
    },
    searchDirnameDocumentParams() {
      const index = this.index
      const q = `dirname:"${this.documentDirname}"`
      const query = { q, index }
      return { name: 'search', query }
    }
  },
  async created() {
    await this.$store.dispatch('document/getTags')
  },
  methods: {
    getDocumentTypeLabel,
    getExtractionLevelTranslationKey,
    itemRowClass(item) {
      return ['document__content__details__item', item.trClass]
    }
  }
}
</script>

<style lang="scss">
.document {
  &__content {
    &__details {
      &__item {
        &__label {
          max-width: 6em;

          &__search {
            visibility: hidden;
          }
        }

        &:hover &__label__search {
          visibility: visible;
        }

        &__input-group {
          & &__input,
          & &__copy {
            background: $input-bg;
          }

          & &__copy {
            border-color: $input-border-color;
          }
        }
      }
    }
  }
}
</style>
