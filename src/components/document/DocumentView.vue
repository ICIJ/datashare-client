<template>
  <div v-if="!isReady">
    <content-placeholder class="document m-3 py-2 px-3" />
  </div>
  <div v-else>
    <div class="document m-3" v-if="document">
      <div class="document__header">
        <h3>
          <document-sliced-name :document="document" />
          <a class="btn btn-link float-right" :href="getFullUrl" target="_blank" :title="$t('document.download_file')">
            <fa icon="download" class="text-white" />
            <span class="sr-only">{{ $t('document.download_button') }}</span>
          </a>
        </h3>
        <nav class="document__header__nav">
          <ul class="list-inline m-0">
            <li class="document__header__nav__item list-inline-item">
              <a @click="tab = 'details'" :class="{ active: tab === 'details' }">
                {{ $t('document.details') }}
              </a>
            </li>
            <li class="document__header__nav__item list-inline-item" v-if="!isRemote">
              <a @click="tab = 'named_entities'" :class="{ active: tab === 'named_entities' }">
                {{ $t('document.named_entities') }}
              </a>
            </li>
            <li class="document__header__nav__item list-inline-item">
              <a @click="tab = 'text'" :class="{ active: tab === 'text' }">
                {{ $t('document.extracted_text') }}
              </a>
            </li>
            <li class="document__header__nav__item list-inline-item">
              <a @click="tab = 'preview'" :class="{ active: tab === 'preview' }">
                {{ $t('document.preview') }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div class="tab-content document__content">
        <div class="tab-pane" :class="{active: tab === 'details'}" v-if="tab === 'details'">
          <dl class="row">
            <dt class="col-sm-3">{{ $t('document.name') }}</dt>
            <dd class="col-sm-9 document__content__basename">{{ document.basename }}</dd>
            <dt class="col-sm-3">{{ $t('document.path') }}</dt>
            <dd class="col-sm-9 document__content__path">{{ documentPath }}</dd>
            <dt class="col-sm-3">{{ $t('document.id') }}</dt>
            <dd class="col-sm-9 document__content__id">{{ document.id }}</dd>
            <template v-if="document.source.metadata.tika_metadata_creation_date">
              <dt class="col-sm-3">{{ $t('document.creation_date') }}</dt>
              <dd class="col-sm-9 document__content__creation-date">{{ document.creationDate }}</dd>
            </template>
            <template v-if="document.source.contentLength !== -1">
              <dt class="col-sm-3">{{ $t('document.size') }}</dt>
              <dd class="col-sm-9 document__content__size">{{ document.humanSize }}</dd>
            </template>
            <template v-if="document.source.language !== 'UNKNOWN'">
              <dt class="col-sm-3">{{ $t('document.content_language') }}</dt>
              <dd class="col-sm-9">{{ $te(`facet.lang.${document.source.language}`) ? $t(`facet.lang.${document.source.language}`): document.source.language }}</dd>
            </template>
            <template v-if="document.source.contentType !== 'unknown'">
              <dt class="col-sm-3">{{ $t('document.content_type') }}</dt>
              <dd class="col-sm-9">{{ getDocumentTypeLabel(document.source.contentType) }}</dd>
            </template>
            <template v-if="document.source.contentEncoding !== 'unknown'">
              <dt class="col-sm-3">{{ $t('document.content_encoding') }}</dt>
              <dd class="col-sm-9">{{ document.source.contentEncoding }}</dd>
            </template>
            <template v-if="document.source.extractionLevel > 0">
              <dt class="col-sm-3">{{ $t('facet.extraction-level') }}</dt>
              <dd class="col-sm-9 document__content__tree-level">{{ $t(getExtractionLevelTranslationKey(document.source.extractionLevel)) }}</dd>
            </template>
            <template v-if="document.source.extractionLevel > 0 && parentDocument">
              <dt class="col-sm-3">{{ $t('document.parent_document') }}</dt>
              <dd class="col-sm-9">
                <router-link :to="{ name: 'document', params: { id: document.source.parentDocument, routing: document.routing } }" class="document__content__parent">
                  {{ parentDocument.basename }}
                </router-link>
              </dd>
            </template>
          </dl>
        </div>
        <div class="tab-pane document__named-entities" :class="{active: tab === 'named_entities'}" v-if="tab === 'named_entities'">
          <div v-if="!isRemote && document.source.nerTags.length === 0" class="document__named-entities--not--searched">
            <div v-html="$t('document.named_entites_not_searched', { indexing_link: '#/indexing' })"></div>
          </div>
          <div v-else-if="groupByCategories(namedEntities).length === 0" class="document__named-entities--not--found">
            {{ $t('document.named_entities_not_found') }}
          </div>
          <div v-else>
            <div v-for="(results, index) in groupByCategories(namedEntities)" :key="index" class="mb-4">
              <div class="mb-2" :class="getCategoryClass(results[0].source.category, 'text-')">
                <fa :icon="getCategoryIcon(results[0].source.category)" />
                {{ $t('facet.named-entity-' + results[0].source.category.toLowerCase()) }} <i>({{ results.length }})</i>
              </div>
              <span v-for="(result, index) in groupByMentionNorm(results)" :key="index" class="d-inline mr-2">
                <span class="badge badge-pill p-0 badge-light text-uppercase text-black border" :class="getCategoryClass(result[0].source.category, 'border-')">
                  <span class="p-1 d-inline-block" :title="capitalize(result[0].source.mentionNorm)"  v-b-tooltip.hover>
                    {{ result[0].source.mentionNorm }}
                  </span>
                  <span class="bg-darkest text-light p-1 px-2 d-inline-block" :title="$tc('aggregations.mentions.occurrence', result.length, { count: result.length })" :class="getCategoryClass(result[0].source.category, 'bg-')" v-b-tooltip.hover>
                    {{ result.length }}
                  </span>
                </span>
              </span>
            </div>
          </div>
        </div>
        <div class="tab-pane text-pre-wrap" :class="{ active: tab === 'text' }" v-html="markedSourceContent()" v-if="tab === 'text'" />
        <div class="tab-pane" :class="{ active: tab === 'preview' }" v-if="tab === 'preview'">
          <template v-if="document.contentType === 'application/pdf'">
            <pdf-viewer :document="document" />
          </template>
          <template v-else-if="document.contentType === 'image/tiff'">
            <tiff-viewer :document="document" />
          </template>
          <template v-else-if="document.contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || document.contentType === 'text/csv'">
            <spreadsheet-viewer :document="document" />
          </template>
          <template v-else>
            {{ $t('document.not_available') }}
          </template>
        </div>
      </div>
    </div>
    <div v-else class="nodocument">
      <fa icon="exclamation-triangle" />
      <span>{{ $t('document.not_found') }}</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import DocumentSlicedName from '@/components/DocumentSlicedName'
import PdfViewer from '@/components/document/PdfViewer'
import SpreadsheetViewer from '@/components/document/SpreadsheetViewer'
import TiffViewer from '@/components/document/TiffViewer'
import ner from '@/mixins/ner'
import utils from '@/mixins/utils'
import { highlight } from '@/utils/strings'
import { getDocumentTypeLabel, getExtractionLevelTranslationKey } from '@/utils/utils'
import { EventBus } from '@/utils/event-bus'
import DatashareClient from '@/api/DatashareClient'
import escape from 'lodash/escape'
import groupBy from 'lodash/groupBy'
import orderBy from 'lodash/orderBy'
import sortedUniqBy from 'lodash/sortedUniqBy'
import capitalize from 'lodash/capitalize'

export default {
  name: 'document-view',
  mixins: [ner, utils],
  components: {
    DocumentSlicedName,
    PdfViewer,
    SpreadsheetViewer,
    TiffViewer
  },
  props: ['id', 'routing'],
  data () {
    return {
      tab: 'details',
      isReady: false
    }
  },
  mounted () {
    EventBus.$on('facet::hide::named-entities', () => this.$store.dispatch('document/getNamedEntities'))
  },
  methods: {
    getDoc (params = { id: this.id, routing: this.routing }) {
      this.isReady = false
      return this.$store.dispatch('document/get', params).then(() => this.$store.dispatch('document/getParent')).then(() => this.$store.dispatch('document/getNamedEntities')).then(() => {
        this.isReady = true
      })
    },
    groupByCategories (array) {
      return orderBy(groupBy(array, m => m.source.category), ['length', m => m[0].source.category], ['desc', 'asc'])
    },
    groupByMentionNorm (array) {
      return orderBy(groupBy(array, m => m.source.mentionNorm), ['length', m => m[0].source.mentionNorm], ['desc', 'asc'])
    },
    markedSourceContent () {
      if (this.document) {
        return highlight(this.document.source.content, sortedUniqBy(this.namedEntities, ne => ne.source.offset), m => {
          return `<mark class="ner ${this.getCategoryClass(m.category, 'bg-')}">${m.source.mention}</mark>`
        }, r => escape(r), m => m.source.mention)
      }
    },
    capitalize,
    getDocumentTypeLabel,
    getExtractionLevelTranslationKey
  },
  computed: {
    ...mapState('document', {
      document: 'doc',
      namedEntities: 'namedEntities',
      parentDocument: 'parentDoc'
    }),
    getFullUrl () {
      return DatashareClient.getFullUrl(this.document.url)
    },
    documentPath () {
      if (this.$config.get('mountedDataDir')) {
        return this.document.source.path.replace(this.$config.get('dataDir'), this.$config.get('mountedDataDir'))
      }
      return this.document.source.path
    }
  },
  beforeRouteEnter (to, _from, next) {
    next(vm => {
      vm.getDoc(to.params)
    })
  },
  beforeRouteUpdate (to, _from, next) {
    this.getDoc(to.params)
    next()
  }
}
</script>

<style lang="scss">
.document {
  box-shadow: 0 2px 10px 0 rgba(black,.05), 0 2px 30px 0 rgba(black,.02);
  border: $gray-200 1px solid;
  background: white;
  min-height: 90vh;

  @media (max-width: 1780px) {
    margin-top: 0;
  }

  @include media-breakpoint-down(lg) {
    margin-top: $spacer;
  }

  .badge-pill {
    overflow: hidden;
  }

  &__header {
    @include gradient-directional(darken($primary, 10), $primary);
    color: white;
    padding: $spacer * 2 $spacer;
    padding-bottom: 0;
    display: inline-block;
    width: 100%;

    &__nav {
      padding-top: $spacer;

      & &__item  {
        margin:0;

        a {
          display: inline-block;
          text-transform: uppercase;
          padding: $spacer * .75 $spacer;
          margin: 0;
          position: relative;
          cursor: pointer;

          &:hover {
            background:rgba(white, .05);
          }

          &.active, &.active:hover {
            font-weight: bold;
            background: white;
            color: $link-color;

            &:before {
              content: "";
              border-top: 2px solid $secondary;
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              box-shadow: 0 0 10px 0 $secondary;
            }
          }
        }
      }
    }
  }

  &__content {
    padding: $spacer * 2 $spacer;

    & .tab-pane {
      & dd {
        word-wrap: break-word;
      }
    }
  }

  .text-pre-wrap {
    white-space: pre-wrap;
  }

  .ner {
    border-bottom: 1px dotted;
  }
}

.nodocument {
  background-color: white;
  font-weight: 800;
  margin: 1em;
  padding: 1em;

  & span {
    margin-left: 1em;
  }
}
</style>
