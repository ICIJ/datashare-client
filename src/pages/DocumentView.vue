<template>
  <v-wait for="load document data">
    <content-placeholder slot="waiting" class="document py-2 px-3"></content-placeholder>
    <div
      v-if="doc"
      v-shortkey="getKeys('tabNavigation')"
      class="d-flex flex-column document"
      :class="{ 'document--standalone': isStandalone, 'document--modal': isModal }"
      @shortkey="getAction('tabNavigation')"
    >
      <div class="document__header">
        <hook name="document.header:before"></hook>
        <h3 class="document__header__name" :class="{ 'document__header__name--has-subject': doc.hasSubject }">
          <hook name="document.header.name:before"></hook>
          <document-sliced-name interactive-root :document="doc" />
          <div v-if="doc.hasSubject" class="document__header__name__subject">
            {{ doc.subject }}
          </div>
          <hook name="document.header.name:after"></hook>
        </h3>
        <hook name="document.header.tags:before"></hook>
        <document-tags-form
          class="px-3 mx-0"
          :display-form="false"
          :display-tags="true"
          :document="doc"
          mode="dark"
          :tags="tags"
        ></document-tags-form>
        <hook name="document.header.tags:after"></hook>
        <hook name="document.header.nav:before"></hook>
        <nav class="document__header__nav text-nowrap overflow-auto">
          <ul class="list-inline m-0">
            <hook name="document.header.nav.items:before" tag="li"></hook>
            <template v-for="tab in visibleTabs">
              <hook
                :key="`hook.${tab.name}:before`"
                :name="`document.header.nav.items.${tab.name}:before`"
                tag="li"
              ></hook>
              <li :key="tab.name" class="document__header__nav__item list-inline-item" :title="$t(tab.label)">
                <a :class="{ active: isTabActive(tab.name) }" @click="$root.$emit('document::tab', tab.name)">
                  <hook :name="`document.header.nav.${tab.name}:before`"></hook>
                  <fa v-if="tab.icon" :icon="tab.icon" class="mr-2"></fa>
                  <component :is="tab.labelComponent" v-if="tab.labelComponent"></component>
                  <template v-else>{{ $t(tab.label) }}</template>
                  <hook :name="`document.header.nav.${tab.name}:after`"></hook>
                </a>
              </li>
              <hook
                :key="`hook.${tab.name}:after`"
                :name="`document.header.nav.items.${tab.name}:after`"
                tag="li"
              ></hook>
            </template>
            <hook name="document.header.nav.items:after" tag="li"></hook>
          </ul>
        </nav>
        <hook name="document.header.nav:after"></hook>
        <hook name="document.header:after"></hook>
      </div>
      <div class="d-flex flex-grow-1 flex-column tab-content document__content">
        <component
          :is="getComponentIfActive(tab)"
          v-for="tab in visibleTabs"
          :key="tab.name"
          class="document__content__pane tab-pane flex-grow-1 w-100"
          :class="tabClass(tab.name)"
          v-bind="getPropsIfActive(tab)"
        >
        </component>
      </div>
    </div>
    <div v-else class="nodocument">
      <fa icon="exclamation-triangle"></fa>
      <span>{{ $t('document.notFound') }}</span>
    </div>
  </v-wait>
</template>

<script>
import { filter, findIndex } from 'lodash'
import { mapState } from 'vuex'

import DocumentSlicedName from '@/components/DocumentSlicedName'
import DocumentTagsForm from '@/components/DocumentTagsForm'
import Hook from '@/components/Hook'
import shortkeys from '@/mixins/shortkeys'

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
      vm.getDoc(to.params)
    })
  },
  beforeRouteUpdate(to, _from, next) {
    this.getDoc(to.params)
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
      activeTab: 'extracted-text',
      tabsThoughtPipeline: []
    }
  },
  computed: {
    ...mapState('document', ['doc', 'parentDocument', 'tags']),
    visibleTabs() {
      return filter(this.tabsThoughtPipeline, (t) => !t.hidden)
    },
    tabsPipeline() {
      return this.$store.getters['pipelines/applyPipelineChainByCategory']('document-view-tabs')
    },
    tabs() {
      return !this.doc
        ? []
        : [
            {
              name: 'extracted-text',
              label: 'document.extractedText',
              component: () => import('@/components/document/DocumentTabExtractedText'),
              icon: 'align-left',
              props: {
                document: this.doc,
                q: this.q
              }
            },
            {
              name: 'preview',
              label: 'document.preview',
              component: () => import('@/components/document/DocumentTabPreview'),
              icon: 'eye',
              props: {
                document: this.doc
              }
            },
            {
              name: 'details',
              label: 'document.tabDetails',
              component: () => import('@/components/document/DocumentTabDetails'),
              icon: 'info-circle',
              props: {
                document: this.doc,
                parentDocument: this.parentDocument
              }
            },
            {
              name: 'named-entities',
              label: 'document.namedEntities',
              hidden: this.$config.isnt('manageDocuments') && !this.doc.hasNerTags,
              component: () => import('@/components/document/DocumentTabNamedEntities'),
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
    }
  },
  watch: {
    doc() {
      return this.setTabs()
    }
  },
  async mounted() {
    if (!this.$wait.is('load document data')) {
      await this.getDoc()
    }
    await this.getDownloadStatus()
    await this.setTabs()
    // Listen for event to switch tab
    this.$root.$on('document::tab', this.activateTab)
  },
  methods: {
    async getDoc(params = { id: this.id, routing: this.routing, index: this.index }) {
      this.$wait.start('load document data')
      this.$Progress.start()
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
        this.$root.$emit('scroll-tracker:request', this.$el, 0, container)
        this.$root.$emit('document::content::changed')
      }
      this.$wait.end('load document data')
      this.$Progress.finish()
    },
    async setTabs() {
      if (this.doc) {
        // This apply the document-view-tabs pipeline everytime a document is loaded
        this.tabsThoughtPipeline = await this.tabsPipeline(this.tabs, this.doc)
      } else {
        this.tabsThoughtPipeline = []
      }
    },
    getDownloadStatus() {
      return this.$store.dispatch('downloads/fetchIndexStatus', this.index)
    },
    isTabActive(name) {
      return this.activeTab === name
    },
    activateTab(name) {
      if (findIndex(this.visibleTabs, { name }) > -1) {
        this.$set(this, 'activeTab', name)
        this.$root.$emit('document::content::changed')
        return name
      }
    },
    tabClass(name) {
      return {
        active: this.isTabActive(name),
        ['document__content__pane--' + name]: true
      }
    },
    shortKeyAction(event) {
      switch (event.srcKey) {
        case 'goToPreviousTab':
          this.goToPreviousTab()
          break
        case 'goToNextTab':
          this.goToNextTab()
          break
      }
    },
    goToPreviousTab() {
      const indexPreviousActiveTab = this.indexActiveTab === 0 ? this.visibleTabs.length - 1 : this.indexActiveTab - 1
      this.$set(this, 'activeTab', this.visibleTabs[indexPreviousActiveTab].name)
    },
    goToNextTab() {
      const indexNextActiveTab = this.indexActiveTab === this.visibleTabs.length - 1 ? 0 : this.indexActiveTab + 1
      this.$set(this, 'activeTab', this.visibleTabs[indexNextActiveTab].name)
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

  .badge-pill {
    overflow: hidden;
  }

  &__header {
    @include gradient-directional($primary, theme-color(dark));
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

          &:hover {
            background: rgba(white, 0.05);
          }

          &.active,
          &.active:hover {
            background: white;
            color: $link-color;
            font-weight: bold;

            &:before {
              border-top: 2px solid $secondary;
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
