<template>
  <v-wait for="load document data">
    <template #waiting>
      <content-placeholder class="document py-2 px-3"></content-placeholder>
    </template>
    <div
      v-if="doc"
      v-shortkey="getKeys('tabNavigation')"
      class="d-flex flex-column document"
      :class="{ 'document--standalone': isStandalone, 'document--modal': isModal }"
      @shortkey="getAction('tabNavigation')"
    >
      <div class="document__header">
        <hook name="document.header:before" />
        <h3 class="document__header__name" :class="{ 'document__header__name--has-subject': doc.hasSubject }">
          <hook name="document.header.name:before" />
          <document-sliced-name interactive-root :document="doc" />
          <div v-if="doc.hasSubject" class="document__header__name__subject">
            {{ doc.subject }}
          </div>
          <hook name="document.header.name:after" />
        </h3>
        <hook name="document.header.tags:before" />
        <document-tags-form
          class="px-3 mx-0"
          :display-form="false"
          :display-tags="true"
          :document="doc"
          mode="dark"
          :tags="tags"
        ></document-tags-form>
        <hook name="document.header.tags:after" />
        <hook name="document.header.nav:before" />
        <nav class="document__header__nav text-nowrap overflow-auto">
          <hook name="document.header.nav.items:before" :bind="{ tag: 'li' }" />
          <template v-for="tab in visibleTabs" :key="tab.name">
            <div class="d-inline-block">
              <hook :name="`document.header.nav.items.${tab.name}:before`" :bind="{ tag: 'li' }" />
              <div class="document__header__nav__item d-inline-block" :title="$t(tab.label)">
                <router-link
                  :class="{ active: isTabActive(tab.name) }"
                  :to="{ query: { q: $route.query.q, tab: tab.name } }"
                >
                  <hook :name="`document.header.nav.${tab.name}:before`" />
                  <fa v-if="tab.icon" :icon="tab.icon" class="me-2"></fa>
                  <component :is="tab.labelComponent" v-if="tab.labelComponent"></component>
                  <template v-else>{{ $t(tab.label) }}</template>
                  <hook :name="`document.header.nav.${tab.name}:after`" />
                </router-link>
              </div>
              <hook :name="`document.header.nav.items.${tab.name}:after`" :bind="{ tag: 'li' }" />
            </div>
          </template>
          <hook name="document.header.nav.items:after" :bind="{ tag: 'li' }" />
        </nav>
        <hook name="document.header.nav:after" />
        <hook name="document.header:after" />
      </div>
      <div class="d-flex flex-grow-1 flex-column tab-content document__content">
        <component
          :is="getComponentIfActive(tab)"
          v-for="tab in visibleTabs"
          :key="tab.name"
          class="document__content__pane tab-pane flex-grow-1 w-100"
          :class="tabClass(tab.name)"
          v-bind="getPropsIfActive(tab)"
        />
      </div>
    </div>
    <div v-else class="nodocument">
      <fa icon="triangle-exclamation"></fa>
      <span>{{ $t('document.notFound') }}</span>
    </div>
  </v-wait>
</template>

<script>
import { markRaw } from 'vue'
import { filter, findIndex } from 'lodash'
import { mapState } from 'vuex'

import DocumentTabExtractedText from '@/components/Document/DocumentTab/DocumentTabExtractedText'
import DocumentTabPreview from '@/components/Document/DocumentTab/DocumentTabPreview'
import DocumentTabDetails from '@/components/Document/DocumentTab/DocumentTabDetails'
import DocumentTabNamedEntities from '@/components/Document/DocumentTab/DocumentTabNamedEntities'
import DocumentTagsForm from '@/components/DocumentTagsForm'
import DocumentSlicedName from '@/components/DocumentSlicedName'
import Hook from '@/components/Hook'
import shortkeys from '@/mixins/shortkeys'
import { TAB_NAME } from '@/store/modules/search'

export default {
  name: 'DocumentView',
  components: {
    DocumentSlicedName,
    DocumentTagsForm,
    Hook
  },
  mixins: [shortkeys],
  beforeRouteEnter(to, _from, next) {
    next((vm) => {
      return vm.getDoc(to.params)
    })
  },
  async beforeRouteUpdate(to, _from, next) {
    await this.getDoc(to.params)
    next()
  },
  props: {
    id: {
      type: String
    },
    routing: {
      type: String
    },
    index: {
      type: String
    },
    /**
     * Local search query inside the extracted text.
     */
    q: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      activeTab: TAB_NAME.EXTRACTED_TEXT,
      tabsThroughPipeline: []
    }
  },
  computed: {
    ...mapState('document', ['doc', 'parentDocument', 'tab', 'tags']),
    tabNames() {
      return this.visibleTabs.map((t) => t.name)
    },
    visibleTabs() {
      return !this.doc ? [] : filter(this.tabsThroughPipeline, (t) => !t.hidden)
    },
    tabsPipeline() {
      return this.$store.getters['pipelines/applyPipelineChainByCategory']('document-view-tabs')
    },
    tabs() {
      return [
        {
          name: TAB_NAME.EXTRACTED_TEXT,
          label: 'document.extractedText',
          component: markRaw(DocumentTabExtractedText),
          icon: 'align-left',
          props: {
            document: this.doc,
            q: this.q
          }
        },
        {
          name: TAB_NAME.PREVIEW,
          label: 'document.preview',
          component: markRaw(DocumentTabPreview),
          icon: 'eye',
          props: {
            document: this.doc
          }
        },
        {
          name: TAB_NAME.DETAILS,
          label: 'document.tabDetails',
          component: markRaw(DocumentTabDetails),
          icon: 'info-circle',
          props: {
            document: this.doc,
            parentDocument: this.parentDocument
          }
        },
        {
          name: TAB_NAME.NAMED_ENTITIES,
          label: 'document.namedEntities',
          hidden: this.$config.isnt('manageDocuments') && !this.doc.hasNerTags,
          component: markRaw(DocumentTabNamedEntities),
          icon: 'database',
          props: {
            document: this.doc
          }
        }
      ]
    },
    indexActiveTab() {
      return findIndex(this.visibleTabs, (tab) => tab.name === this.activeTab)
    },
    isStandalone() {
      return this.$route.name === 'document-standalone'
    },
    isModal() {
      return this.$route.name === 'document-modal'
    },
    shortkeysActions() {
      return {
        goToPreviousTab: this.goToPreviousTab,
        goToNextTab: this.goToNextTab
      }
    }
  },
  watch: {
    $route: {
      handler({ query }) {
        this.activateTab(query.tab)
      }
    },
    visibleTabs: {
      deep: true,
      handler(tabs) {
        if (tabs.length) {
          this.activateTab(this.$route.query.tab ?? 'extracted-text')
        }
      }
    },
    doc() {
      return this.setTabs()
    },
    activeTab(tab) {
      if (tab === '' || this.tabNames.indexOf(tab) > -1) {
        this.$store.dispatch('search/setTab', tab)
      }
    }
  },
  async mounted() {
    if (!this.$wait.is('load document data')) {
      await this.getDoc()
    }
    await this.getDownloadStatus()
    await this.setTabs()
  },
  methods: {
    async getDoc(params = { id: this.id, routing: this.routing, index: this.index }) {
      this.$wait.start('load document data')
      await this.$store.dispatch('document/get', params)
      await this.$store.dispatch('document/getParent')
      await this.$store.dispatch('document/getRoot')
      await this.$store.dispatch('document/getTags')
      await this.$store.dispatch('document/getRecommendationsByDocuments', await this.$core.auth.getUsername())
      if (this.doc) {
        await this.$core.api.addUserHistoryEvent(
          [this.doc.index],
          'DOCUMENT',
          this.doc.slicedNameToString,
          this.doc.route
        )
        const container = this.$el.closest('.ps-container')
        this.$core.emit('scroll-tracker:request', { element: this.$el, offset: 0, container })
        this.$core.emit('document::content::changed')
      }
      this.$wait.end('load document data')
    },
    async setTabs() {
      if (this.doc) {
        // This apply the document-view-tabs pipeline everytime a document is loaded
        this.tabsThroughPipeline = await this.tabsPipeline(this.tabs, this.doc)
      } else {
        this.tabsThroughPipeline = []
      }
    },
    getDownloadStatus() {
      return this.$store.dispatch('downloads/fetchIndexStatus', this.index)
    },
    isTabActive(name) {
      return this.activeTab === name
    },
    activateTab(name = TAB_NAME.EXTRACTED_TEXT) {
      if (findIndex(this.visibleTabs, { name }) > -1) {
        this.activeTab = name
        this.$core.emit('document::content::changed')
        return name
      }
    },
    tabClass(name) {
      return {
        active: this.isTabActive(name),
        ['document__content__pane--' + name]: true
      }
    },
    goToPreviousTab() {
      const indexPreviousActiveTab = this.indexActiveTab === 0 ? this.visibleTabs.length - 1 : this.indexActiveTab - 1
      this.activeTab = this.visibleTabs[indexPreviousActiveTab].name
    },
    goToNextTab() {
      const indexNextActiveTab = this.indexActiveTab === this.visibleTabs.length - 1 ? 0 : this.indexActiveTab + 1
      this.activeTab = this.visibleTabs[indexNextActiveTab].name
    },
    getComponentIfActive({ component, name }) {
      if (this.isTabActive(name)) {
        return component
      }
      return 'div'
    },
    getPropsIfActive({ name, props }) {
      if (this.isTabActive(name)) {
        return props
      }
      return {}
    },
    shortKeyAction({ srcKey }) {
      if (this.shortkeysActions[srcKey]) {
        return this.shortkeysActions[srcKey]()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.document {
  background: white;
  margin: 0;

  &--standalone,
  &--modal {
    min-height: 100vh;
  }

  .rounded-pill {
    overflow: hidden;
  }

  &__header {
    background: $primary;
    color: white;
    display: inline-block;
    padding: $spacer * 2 0 0 0;
    width: 100%;

    &__name {
      padding: 0 $spacer;

      a,
      a:hover {
        color: white;
      }

      &--has-subject:deep(.document-sliced-name) {
        font-size: 1rem;
        opacity: 0.5;
      }
    }

    &__nav {
      padding: $spacer $spacer 0;

      & &__item {
        margin: 0;

        a {
          color: white;
          cursor: pointer;
          display: inline-block;
          font-size: 0.8em;
          font-weight: bolder;
          margin: 0;
          padding: $spacer * 0.75 $spacer;
          position: relative;
          text-transform: uppercase;
          border-radius: $border-radius $border-radius 0 0;

          &:hover {
            background: rgba(white, 0.05);
          }

          &.active,
          &.active:hover {
            background: white;
            color: $link-color;
            font-weight: bold;

            &:before {
              border-radius: $border-radius $border-radius 0 0;
              background: $secondary;
              height: 2px;
              box-shadow: 0 0 10px 0 $secondary;
              content: '';
              left: 0;
              position: absolute;
              right: 0;
              top: 0;
            }
          }
        }
      }
    }
  }

  .ner {
    border-bottom: 1px dotted;
  }

  &__content {
    &__pane {
      max-width: 100%;
    }

    .tab-content > &__pane--preview.active {
      display: flex;
    }
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
