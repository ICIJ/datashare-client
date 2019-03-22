<template>
  <div v-if="!isReady">
    <content-placeholder class="document py-2 px-3" />
  </div>
  <div v-else>
    <div class="d-flex flex-column document" v-if="document">
      <div class="document__header">
        <h3>
          <document-sliced-name interactive-root :document="document" />
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
            <li class="document__header__nav__item list-inline-item" v-if="!isRemote || namedEntities.length">
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
      <div class="d-flex flex-grow-1 tab-content document__content">
        <div class="tab-pane" :class="{active: tab === 'details'}" v-if="tab === 'details'">
          <document-tab-details :document="document" :parentDocument="parentDocument" />
        </div>
        <div class="tab-pane document__named-entities" :class="{active: tab === 'named_entities'}" v-if="tab === 'named_entities'">
          <document-tab-named-entities :document="document" />
        </div>
        <div class="tab-pane text-pre-wrap" :class="{ active: tab === 'text' }" v-html="markedSourceContent()" v-if="tab === 'text'" />
        <div class="tab-pane d-flex flex-grow-1" :class="{ active: tab === 'preview' }" v-if="tab === 'preview'">
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
import DocumentTabDetails from '@/components/document/DocumentTabDetails'
import DocumentTabNamedEntities from '@/components/document/DocumentTabNamedEntities'
import PdfViewer from '@/components/document/PdfViewer'
import SpreadsheetViewer from '@/components/document/SpreadsheetViewer'
import TiffViewer from '@/components/document/TiffViewer'
import ner from '@/mixins/ner'
import utils from '@/mixins/utils'
import { highlight } from '@/utils/strings'
import DatashareClient from '@/api/DatashareClient'
import escape from 'lodash/escape'
import sortedUniqBy from 'lodash/sortedUniqBy'

export default {
  name: 'document-view',
  mixins: [ner, utils],
  components: {
    DocumentSlicedName,
    DocumentTabDetails,
    DocumentTabNamedEntities,
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
  computed: {
    ...mapState('document', {
      document: 'doc',
      parentDocument: 'parentDoc',
      namedEntities: 'namedEntities'
    }),
    getFullUrl () {
      return DatashareClient.getFullUrl(this.document.url)
    }
  },
  methods: {
    async getDoc (params = { id: this.id, routing: this.routing }) {
      this.isReady = false
      await this.$store.dispatch('document/get', params)
      await this.$store.dispatch('document/getParent')
      await this.$store.dispatch('document/getNamedEntities')
      this.isReady = true
      if (this.document) {
        await this.$store.commit('userHistory/addDocument', this.document)
      }
    },
    markedSourceContent () {
      if (this.document) {
        return highlight(this.document.source.content, sortedUniqBy(this.namedEntities, ne => ne.source.offset), m => {
          return `<mark class="ner ${this.getCategoryClass(m.category, 'bg-')}">${m.source.mention}</mark>`
        }, r => escape(r), m => m.source.mention)
      }
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
  overflow: hidden;
  background: white;
  min-height: 90vh;
  margin: 0;

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
          font-weight: bolder;
          font-size: 0.9em;
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
