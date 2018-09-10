<template>
  <div v-if="!isReady">
    <content-placeholder class="document py-2 px-3" />
  </div>
  <div v-else>
    <div class="document" v-if="document">
      <div class="document__header">
        <h3>
          <span>{{ document.basename }}</span>
          <a class="btn btn-link float-right" :href="getFullUrl" target="_blank" title="Download source file">
            <font-awesome-icon icon="download" />
            <span class="sr-only">{{ $t('document.download_button') }}</span>
          </a>
        </h3>
        <nav class="document__header__nav">
          <ul class="list-inline">
            <li class="document__header__nav__item list-inline-item">
              <a @click="tab = 'details'" :class="{active: tab === 'details'}">
                {{ $t('document.details') }}
              </a>
            </li>
            <li class="document__header__nav__item list-inline-item">
              <a @click="tab = 'named_entities'" :class="{active: tab === 'named_entities'}">
                {{ $t('document.named_entities') }}
              </a>
            </li>
            <li class="document__header__nav__item list-inline-item">
              <a @click="tab = 'text'" :class="{active: tab === 'text'}">
                {{ $t('document.extracted_text') }}
              </a>
            </li>
            <li class="document__header__nav__item list-inline-item">
              <a @click="tab = 'preview'" :class="{active: tab === 'preview'}">
                {{ $t('document.preview') }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div class="tab-content document__content">
        <div class="tab-pane" v-bind:class="{active: tab === 'details'}">
          <dl class="row">
            <dt class="col-sm-3">{{ $t('document.name') }}</dt>
            <dd class="col-sm-9">{{ document.basename }}</dd>
            <dt class="col-sm-3">{{ $t('document.path') }}</dt>
            <dd class="col-sm-9">{{ document.source.path }}</dd>
            <dt class="col-sm-3">{{ $t('document.id') }}</dt>
            <dd class="col-sm-9">{{ document.id }}</dd>
            <template v-if="document.source.metadata.tika_metadata_creation_date">
              <dt class="col-sm-3">{{ $t('document.creation_date') }}</dt>
              <dd class="col-sm-9">{{ document.creationDate }}</dd>
            </template>
            <template v-if="document.source.contentLength !== -1">
              <dt class="col-sm-3">{{ $t('document.size') }}</dt>
              <dd class="col-sm-9">{{ document.humanSize }}</dd>
            </template>
            <template v-if="document.source.language !== 'UNKNOWN'">
              <dt class="col-sm-3">{{ $t('document.content_language') }}</dt>
              <dd class="col-sm-9">{{ document.source.language }}</dd>
            </template>
            <template v-if="document.source.contentType !== 'unknown'">
              <dt class="col-sm-3">{{ $t('document.content_type') }}</dt>
              <dd class="col-sm-9">{{ document.source.contentType }}</dd>
            </template>
            <template v-if="document.source.contentEncoding !== 'unknown'">
              <dt class="col-sm-3">{{ $t('document.content_encoding') }}</dt>
              <dd class="col-sm-9">{{ document.source.contentEncoding }}</dd>
            </template>
            <template v-if="document.source.extractionLevel > 0">
              <dt class="col-sm-3">{{ $t('document.tree_level') }}</dt>
              <dd class="col-sm-9">{{ document.source.extractionLevel }}</dd>
            </template>
            <template v-if="document.source.extractionLevel > 0 && parentDocument">
              <dt class="col-sm-3">{{ $t('document.parent_document') }}</dt>
              <dd class="col-sm-9">
                <router-link :to="{ name: 'document', params: { id: document.source.parentDocument, routing: document.routing } }">
                  {{ parentDocument.basename }}
                </router-link>
              </dd>
            </template>
          </dl>
        </div>
        <div class="tab-pane document__named-entities" v-bind:class="{active: tab === 'named_entities'}">
          <div v-if="document.source.nerTags.length === 0" class="document__named-entities--not--searched">
            {{ $t('document.named_entites_not_searched') }}
          </div>
          <div v-else-if="groupByCategories(namedEntities).length === 0" class="document__named-entities--not--found">
            {{ $t('document.named_entities_not_found') }}
          </div>
          <div v-else>
            <div v-for="(results, index) in groupByCategories(namedEntities)" :key="index" class="mb-4">
              <div class="mb-2" :class="getCategoryClass(results[0].source.category, 'text-')">
                <font-awesome-icon :icon="getCategoryIcon(results[0].source.category)" />
                {{ capitalize(results[0].source.category) }} <i>({{ results.length }})</i>
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
        <div class="tab-pane text-pre-wrap" v-bind:class="{active: tab === 'text'}" v-html="markedSourceContent()"></div>
        <div class="tab-pane" v-bind:class="{active: tab === 'preview'}">
          <template v-if="document.contentType === 'application/pdf'">
            <pdf-viewer :url="document.relativePath" />
          </template>
          <template v-else-if="document.contentType === 'image/tiff'">
            <tiff-viewer :url="document.relativePath" />
          </template>
          <template v-else-if="document.contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || document.contentType === 'text/csv'">
            <spreadsheet-viewer :url="document.relativePath" :type="document.contentType"/>
          </template>
          <template v-else>
            Not available
          </template>
        </div>
      </div>
    </div>
    <div v-else class="nodocument">
      <font-awesome-icon icon="exclamation-triangle" />
      <span>{{ $t('document.not_found') }}</span>
    </div>
  </div>
</template>

<script>
import { capitalize, highlight } from '@/utils/strings'
import { mapState } from 'vuex'
import DatashareClient from '@/api/DatashareClient'
import escape from 'lodash/escape'
import groupBy from 'lodash/groupBy'
import ner from '@/mixins/ner'
import orderBy from 'lodash/orderBy'
import PdfViewer from './PdfViewer'
import sortedUniqBy from 'lodash/sortedUniqBy'
import SpreadsheetViewer from './SpreadsheetViewer'
import TiffViewer from './TiffViewer'
import ContentPlaceholder from '@/components/ContentPlaceholder'
import { EventBus } from '@/utils/event-bus.js'

export default {
  name: 'document-view',
  mixins: [ner],
  components: {
    ContentPlaceholder,
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
    EventBus.$on('facet::hide::named-entities', () => {
      return this.$store.dispatch('document/getNamedEntities')
    })
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
    capitalize: capitalize
  },
  computed: {
    ...mapState('document', {
      document: state => state.doc,
      namedEntities: state => state.namedEntities,
      parentDocument: state => state.parentDoc
    }),
    getFullUrl () {
      return DatashareClient.getFullUrl(this.document.relativePath)
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

  .badge-pill {
    overflow: hidden;
  }

  &__header {
    background: theme-color('dark');
    color: white;
    padding: $spacer * 2 $spacer;
    padding-bottom: 0;

    &__nav {
      padding-top: $spacer;

      & &__item  {
        margin:0;

        a {
          display: inline-block;
          color: white;
          border-bottom: 3px solid transparent;
          text-transform: uppercase;
          padding: $spacer * .75 $spacer;
          margin: 0;
          cursor: pointer;

          &:hover {
            background:rgba(white, .05);
          }

          &.active {
            font-weight: bold;
            border-color: theme-color('primary');
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
