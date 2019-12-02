<template>
  <div v-if="!isReady">
    <content-placeholder class="document py-2 px-3" />
  </div>
  <div v-else>
    <div class="d-flex flex-column document" v-if="document" v-shortkey="getKeys('tabNavigation')" @shortkey="getAction('tabNavigation')" :class="{ 'document--simplified': $route.name === 'document-simplified' }">
      <div class="document__header">
        <h3 class="document__header__name">
          <document-sliced-name interactive-root :document="document" />
        </h3>
        <document-tags-form :document="document" :tags="tags" :displayTags="true" :displayForm="false" class="ml-0" mode="dark" />
        <nav class="document__header__nav text-nowrap overflow-auto">
          <ul class="list-inline m-0">
            <li class="document__header__nav__item list-inline-item" v-for="tab in visibleTabs" :key="tab.name">
              <a @click="activateTab(tab.name)" :class="{ active: isTabActive(tab.name) }">
                <fa :icon="tab.icon" v-if="tab.icon" class="mr-2" />
                {{ $t(tab.label) }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div class="d-flex flex-grow-1 tab-content document__content">
        <div class="document__content__pane tab-pane w-100" :class="tabClass(tab.name)" v-for="tab in visibleTabs" :key="tab.name">
          <component v-if="isTabActive(tab.name)" :is="tab.component" v-bind="tab.props"></component>
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
import filter from 'lodash/filter'
import findIndex from 'lodash/findIndex'
import { mapState } from 'vuex'

import DocumentSlicedName from '@/components/DocumentSlicedName'
import DocumentTagsForm from '@/components/DocumentTagsForm'
import shortkeys from '@/mixins/shortkeys'

export default {
  name: 'DocumentView',
  mixins: [shortkeys],
  components: {
    DocumentSlicedName,
    DocumentTagsForm
  },
  props: {
    id: String,
    routing: String,
    index: String
  },
  data () {
    return {
      activeTab: 'extracted-text',
      isReady: false
    }
  },
  methods: {
    async getDoc (params = { id: this.id, routing: this.routing, index: this.index }) {
      this.$set(this, 'isReady', false)
      this.$Progress.start()
      await this.$store.dispatch('document/get', params)
      await this.$store.dispatch('document/getParent')
      await this.$store.dispatch('document/getTags')
      if (this.document) {
        await this.$store.commit('userHistory/addDocument', this.document)
        const container = this.$el.closest('.ps-container')
        this.$root.$emit('scroll-tracker:request', this.$el, 0, container)
        this.$root.$emit('document::content::changed')
      }
      this.$set(this, 'isReady', true)
      this.$Progress.finish()
    },
    isTabActive (name) {
      return this.activeTab === name
    },
    activateTab (name) {
      this.$set(this, 'activeTab', name)
      this.$root.$emit('document::content::changed')
      return name
    },
    tabClass (name) {
      return {
        'active': this.isTabActive(name),
        ['document__content__pane--' + name]: true
      }
    },
    shortKeyAction (event) {
      switch (event.srcKey) {
        case 'goToPreviousTab':
          this.goToPreviousTab()
          break
        case 'goToNextTab':
          this.goToNextTab()
          break
      }
    },
    goToPreviousTab () {
      const indexActiveTab = findIndex(this.visibleTabs, tab => tab.name === this.activeTab)
      const indexPreviousActiveTab = indexActiveTab === 0 ? this.visibleTabs.length - 1 : indexActiveTab - 1
      this.$set(this, 'activeTab', this.visibleTabs[indexPreviousActiveTab].name)
    },
    goToNextTab () {
      const indexActiveTab = findIndex(this.visibleTabs, tab => tab.name === this.activeTab)
      const indexNextActiveTab = indexActiveTab === this.visibleTabs.length - 1 ? 0 : indexActiveTab + 1
      this.$set(this, 'activeTab', this.visibleTabs[indexNextActiveTab].name)
    }
  },
  computed: {
    ...mapState('document', {
      document: 'doc',
      parentDocument: 'parentDocument',
      tags: 'tags'
    }),
    visibleTabs () {
      return filter(this.tabs, t => !t.hidden)
    },
    tabs () {
      return [
        {
          name: 'extracted-text',
          label: 'document.extracted_text',
          component: () => import('@/components/document/DocumentTabExtractedText'),
          icon: 'align-left',
          props: {
            document: this.document
          }
        },
        {
          name: 'details',
          label: 'document.tab_details',
          component: () => import('@/components/document/DocumentTabDetails'),
          icon: 'info-circle',
          props: {
            document: this.document,
            parentDocument: this.parentDocument
          }
        },
        {
          name: 'translations',
          label: 'document.translations',
          component: () => import('@/components/document/DocumentTabTranslations'),
          hidden: !this.document.hasTranslations,
          icon: 'globe',
          props: {
            document: this.document
          }
        },
        {
          name: 'named-entities',
          label: 'document.named_entities',
          hidden: this.$config.isnt('manageDocuments') && !this.document.hasNerTags,
          component: () => import('@/components/document/DocumentTabNamedEntities'),
          icon: 'database',
          props: {
            document: this.document
          }
        },
        {
          name: 'preview',
          label: 'document.preview',
          component: () => import('@/components/document/DocumentTabPreview'),
          icon: 'eye',
          props: {
            document: this.document
          }
        }
      ]
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
  background: white;
  margin: 0;

  &--simplified {
    min-height: 100vh;
  }

  .badge-pill {
    overflow: hidden;
  }

  &__header {
    @include gradient-directional($primary, theme-color(dark));
    color: white;
    padding: $spacer * 2 0;
    padding-bottom: 0;
    display: inline-block;
    width: 100%;

    &__name {
      padding: 0 $spacer;

      a, a:hover {
        color: white;
      }
    }

    &__nav {
      padding: $spacer $spacer 0;

      & &__item  {
        margin:0;

        a {
          display: inline-block;
          text-transform: uppercase;
          font-weight: bolder;
          font-size: 0.8em;
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
