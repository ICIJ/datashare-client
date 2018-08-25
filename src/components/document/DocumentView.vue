<template>
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
      <div class="tab-pane" v-bind:class="{active: tab === 'named_entities'}">
        <div v-for="(results, index) in groupByCategories(namedEntities)" :key="index">
        {{ results[0].source.category }} ({{ results.length }})
          <div v-for="(result, index) in groupByMentionNorm(results)" :key="index">
            {{ result[0].source.mentionNorm }} ({{ result.length }})
          </div>
        </div>
      </div>
      <div class="tab-pane text-pre-wrap" v-bind:class="{active: tab === 'text'}" v-html="markedSourceContent"></div>
      <div class="tab-pane" v-bind:class="{active: tab === 'preview'}">
        <template v-if="document.contentType === 'application/pdf'">
          <pdf-viewer :url="document.relativePath" />
        </template>
        <template v-else-if="document.contentType === 'image/tiff'">
          <tiff-viewer :url="document.relativePath" />
        </template>
        <template v-else-if="document.contentType.indexOf('xls') > 0 || document.contentType.indexOf('csv') > 0">
          <spreadsheet-viewer :url="document.relativePath" :type="document.contentType"/>
        </template>
        <template v-else>
          Not available
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { highlight } from '@/utils/strings'
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

export default {
  name: 'document-view',
  mixins: [ner],
  components: {
    PdfViewer,
    SpreadsheetViewer,
    TiffViewer
  },
  props: ['id', 'routing'],
  data () {
    return {
      tab: 'details'
    }
  },
  methods: {
    getDoc (params = { id: this.id, routing: this.routing }) {
      return this.$store.dispatch('document/get', params).then(() => this.$store.dispatch('document/getParent')).then(() => this.$store.dispatch('document/getNamedEntities'))
    },
    groupByCategories (array) {
      return orderBy(groupBy(array, m => m.source.category), ['length', m => m[0].source.category], ['desc', 'asc'])
    },
    groupByMentionNorm (array) {
      return orderBy(groupBy(array, m => m.source.mentionNorm), ['length', m => m[0].source.mentionNorm], ['desc', 'asc'])
    }
  },
  computed: {
    ...mapState('document', {
      document: state => state.doc,
      namedEntities: state => state.namedEntities,
      parentDocument: state => state.parentDoc
    }),
    markedSourceContent () {
      if (this.document) {
        return highlight(this.document.source.content, sortedUniqBy(this.namedEntities, ne => ne.source.offset), m => {
          return `<mark class="ner ${this.getCategoryClass(m.category, 'bg-')}">${m.source.mention}</mark>`
        }, r => escape(r), m => m.source.mention)
      }
    },
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
</style>
