<template>
  <div v-if="!isReady">
    <content-placeholder class="document py-2 px-3" />
  </div>
  <div v-else>
    <div class="d-flex flex-column document" v-if="document">
      <div class="document__header">
        <h3>
          <document-sliced-name interactive-root :document="document" />
          <a class="btn btn-outline-light float-right" :href="document.fullUrl" target="_blank" :title="$t('document.download_file')">
            <fa icon="download" />
            {{ $t('document.download_button') }}
          </a>
          <span class="document__header__see-highlights btn text-light float-right" :title="$t('document.highlights_caution')" @click="toggleShowNamedEntities">
            <fa :icon="showNamedEntities ? 'toggle-on' : 'toggle-off'" />
            {{ $t('document.see_highlights') }}
          </span>
        </h3>
        <nav class="document__header__nav">
          <ul class="list-inline m-0">
            <li class="document__header__nav__item list-inline-item">
              <a @click="tab = 'text'" :class="{ active: tab === 'text' }">
                {{ $t('document.extracted_text') }}
              </a>
            </li>
            <li class="document__header__nav__item list-inline-item" v-if="!isRemote || namedEntities.length">
              <a @click="tab = 'named_entities'" :class="{ active: tab === 'named_entities' }">
                {{ $t('document.named_entities') }}
              </a>
            </li>
            <li class="document__header__nav__item list-inline-item">
              <a @click="tab = 'preview'" :class="{ active: tab === 'preview' }">
                {{ $t('document.preview') }}
              </a>
            </li>
            <li class="document__header__nav__item list-inline-item">
              <a @click="tab = 'details'" :class="{ active: tab === 'details' }">
                {{ $t('document.details') }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div class="d-flex flex-grow-1 tab-content document__content">
        <div class="tab-pane px-4 py-3" :class="{ active: tab === 'text' }" v-if="tab === 'text'">
          <document-tab-extracted-text :document="document" :named-entities="namedEntities" :show-named-entities="showNamedEntities" />
        </div>
        <div class="tab-pane px-4 py-3 document__named-entities" :class="{ active: tab === 'named_entities' }" v-if="tab === 'named_entities'">
          <document-tab-named-entities :document="document" />
        </div>
        <div class="tab-pane w-100" :class="{ active: tab === 'preview' }" v-if="tab === 'preview'">
          <document-tab-preview :document="document" />
        </div>
        <div class="tab-pane px-4 py-3" :class="{ active: tab === 'details' }" v-if="tab === 'details'">
          <document-tab-details :document="document" :parentDocument="parentDocument" />
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
import DocumentTabExtractedText from '@/components/document/DocumentTabExtractedText'
import DocumentTabPreview from '@/components/document/DocumentTabPreview'
import utils from '@/mixins/utils'

export default {
  name: 'DocumentView',
  mixins: [utils],
  components: {
    DocumentSlicedName,
    DocumentTabDetails,
    DocumentTabNamedEntities,
    DocumentTabExtractedText,
    DocumentTabPreview
  },
  props: ['id', 'routing', 'index'],
  data () {
    return {
      tab: 'text',
      isReady: false
    }
  },
  computed: {
    ...mapState('document', {
      document: 'doc',
      parentDocument: 'parentDoc',
      namedEntities: 'namedEntities',
      showNamedEntities: 'showNamedEntities'
    })
  },
  methods: {
    async getDoc (params = { id: this.id, routing: this.routing, index: this.index }) {
      this.isReady = false
      await this.$store.dispatch('document/get', params)
      await this.$store.dispatch('document/getParent')
      await this.$store.dispatch('document/getNamedEntities')
      this.isReady = true
      if (this.document) {
        await this.$store.commit('userHistory/addDocument', this.document)
      }
    },
    toggleShowNamedEntities () {
      this.$store.commit('document/toggleShowNamedEntities')
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
