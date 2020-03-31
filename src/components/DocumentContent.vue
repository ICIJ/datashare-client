<script>
import concat from 'lodash/concat'
import compact from 'lodash/compact'
import identity from 'lodash/identity'
import once from 'lodash/once'
import template from 'lodash/template'
import throttle from 'lodash/throttle'
import { mapGetters, mapState } from 'vuex'
import xss from 'xss'

import DocumentAttachments from '@/components/DocumentAttachments'
import DocumentGlobalSearchTermsTags from '@/components/DocumentGlobalSearchTermsTags'
import DocumentLocalSearchInput from '@/components/DocumentLocalSearchInput'
import Hook from '@/components/Hook'
import ner from '@/mixins/ner'
import utils from '@/mixins/utils'
import LocalSearchWorker from '@/utils/local-search.webworker'
import { highlight } from '@/utils/strings'

export default {
  name: 'DocumentContent',
  components: {
    DocumentAttachments,
    DocumentGlobalSearchTermsTags,
    DocumentLocalSearchInput,
    Hook
  },
  mixins: [ner, utils],
  props: {
    document: {
      type: Object
    },
    translatedContent: {
      type: String
    }
  },
  data () {
    return {
      hasNamedEntities: false,
      hasStickyToolbox: false,
      localSearchIndex: 0,
      localSearchOccurrences: 0,
      localSearchTerm: { label: '' },
      localSearchWorker: null,
      localSearchWorkerInProgress: false,
      transformedContent: ''
    }
  },
  async mounted () {
    // Use already loaded named entities (if any) or count them with a promise
    this.hasNamedEntities = !!this.namedEntities.length || !!await this.getNamedEntitiesTotal()
    // Apply the transformation pipeline once
    await this.transformContent()
  },
  watch: {
    localSearchTerm: throttle(async function () {
      await this.transformContent()
      this.$nextTick(this.jumpToActiveLocalSearchTerm)
    }, 300),
    async showNamedEntities (value) {
      if (value && this.hasNamedEntities) {
        await this.$store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
      }
      await this.transformContent()
    },
    async translatedContent () {
      await this.transformContent()
    },
    // Watch for changes on the pipeline
    contentPipelineFunctions () {
      this.transformContent()
    }
  },
  methods: {
    async transformContent () {
      this.transformedContent = await this.contentPipeline()
    },
    terminateLocalSearchWorker () {
      if (this.localSearchWorker !== null) {
        this.localSearchWorker.terminate()
      }
    },
    createLocalSearchWorker () {
      this.terminateLocalSearchWorker()
      this.localSearchWorker = new LocalSearchWorker()
    },
    buildNamedEntityMark (ne) {
      const extractor = ne.source.extractor
      const mention = ne.source.mention
      const classNames = this.getCategoryClass(ne.source.category, 'ner--')
      return this.namedEntityMarkTemplate({ classNames, extractor, mention })
    },
    addNamedEntitiesMarks (content) {
      return highlight(content, this.namedEntities, this.buildNamedEntityMark, identity, m => m.source.mention)
    },
    addGlobalSearchMarks (content) {
      return this.globalSearchTermsInContent(content, 'length').reduce((content, term, index) => {
        const needle = new RegExp(term.label, 'gi')
        const fn = match => `<mark class="global-search-term" style="border-color: ${this.getTermIndexColor(index)}">${match}</mark>`
        return content.replace(needle, fn)
      }, content)
    },
    addLocalSearchMarks (content, localSearchTerm = this.localSearchTerm) {
      if (localSearchTerm.label.length === 0) return content

      this.createLocalSearchWorker()
      this.localSearchWorkerInProgress = true

      const workerPromise = new Promise(resolve => {
        // We receive a content from the worker
        this.localSearchWorker.addEventListener('message', once(({ data }) => {
          this.localSearchOccurrences = data.localSearchOccurrences
          this.localSearchIndex = data.localSearchIndex
          this.localSearchWorkerInProgress = false
          this.terminateLocalSearchWorker()
          resolve(data.content)
        }))
        // Ignore errors
        this.localSearchWorker.onerror = () => { resolve(content) }
      })

      this.localSearchWorker.postMessage({ content, localSearchTerm })

      return workerPromise
    },
    sanitizeHtml (content) {
      const whiteList = { mark: ['style', 'class', 'title'], p: true }
      return xss(content, { stripIgnoreTag: true, whiteList })
    },
    // The pipeline that transforms the content must be asynchronous
    async contentPipeline () {
      return this.contentPipelineFunctions.reduce(async (content, fn) => {
        return fn(await content)
      }, this.content || '')
    },
    findNextLocalSearchTerm () {
      this.localSearchIndex = Math.min(this.localSearchOccurrences, this.localSearchIndex + 1)
      this.$nextTick(this.jumpToActiveLocalSearchTerm)
    },
    findPreviousLocalSearchTerm () {
      this.localSearchIndex = Math.max(1, this.localSearchIndex - 1)
      this.$nextTick(this.jumpToActiveLocalSearchTerm)
    },
    jumpToActiveLocalSearchTerm () {
      const searchTerms = this.$el.querySelectorAll('.local-search-term')
      const activeSearchTerm = searchTerms[this.localSearchIndex - 1]
      searchTerms.forEach(term => term.classList.remove('local-search-term--active'))
      if (activeSearchTerm) {
        activeSearchTerm.classList.add('local-search-term--active')
        activeSearchTerm.scrollIntoView({ block: 'center', inline: 'nearest' })
      }
    },
    getNamedEntitiesTotal () {
      return this.$store.dispatch('document/getNamedEntitiesTotal')
    },
    getPipelinesByStage (stage = 'pre') {
      return this.$store.getters['pipelines/getPipelineChainByCategory'](`extracted-text:${stage}`)
    }
  },
  computed: {
    ...mapState('document', ['isLoadingNamedEntities']),
    ...mapGetters('document', ['namedEntities']),
    ...mapGetters('search', {
      globalSearchTerms: 'retrieveContentQueryTerms',
      globalSearchTermsInContent: 'retrieveContentQueryTermsInContent'
    }),
    showNamedEntities: {
      set (toggler) {
        this.$store.commit('document/toggleShowNamedEntities', toggler)
      },
      get () {
        return this.$store.state.document.showNamedEntities
      }
    },
    contentPipelineFunctions () {
      // Collect pre pipelines for this category from the store
      const prePipelines = this.getPipelinesByStage('pre')
      // Collect post pipelines for this category from the store
      const postPipelines = this.getPipelinesByStage('post')
      // Main pipelines are always applied
      const mainPipelines = compact([
        (this.shouldApplyNamedEntitiesMarks ? this.addNamedEntitiesMarks : null),
        this.sanitizeHtml,
        this.addLocalSearchMarks,
        this.addGlobalSearchMarks
      ])

      return concat(prePipelines, mainPipelines, postPipelines)
    },
    showNamedEntitiesToggler () {
      return !this.translatedContent && this.hasNamedEntities
    },
    shouldApplyNamedEntitiesMarks () {
      return !this.translatedContent && this.showNamedEntities
    },
    namedEntityMarkTemplate () {
      return template('<mark class="ner <%= classNames %>" title="<%= extractor %>"><%= mention %></mark>')
    },
    content () {
      return this.translatedContent || this.document.source.content
    }
  }
}
</script>

<template>
  <div class="document-content">
    <hook name="document.content:before" />
    <div class="document-content__toolbox d-flex" :class="{ 'document-content__toolbox--sticky': hasStickyToolbox }">
      <hook name="document.content.toolbox:before" />
      <document-global-search-terms-tags
        :document="document"
        @select="localSearchTerm = $event"
        class="p-3 w-100" />
      <document-local-search-input class="ml-auto"
        v-model="localSearchTerm"
        v-bind:activated.sync="hasStickyToolbox"
        @next="findNextLocalSearchTerm"
        @previous="findPreviousLocalSearchTerm"
        :search-occurrences="localSearchOccurrences"
        :search-index="localSearchIndex"
        :search-worker-in-progress="localSearchWorkerInProgress" />
      <hook name="document.content.toolbox:after" />
    </div>
    <div class="d-flex flex-row justify-content-end align-items-center px-3">
      <hook name="document.content.ner:before" class="d-flex flex-row justify-content-end align-items-center" />
      <div class="document-content__ner-toggler py-1 ml-3 font-weight-bold" id="ner-toggler" v-if="showNamedEntitiesToggler">
        <div class="custom-control custom-switch">
          <input type="checkbox" v-model="showNamedEntities" class="custom-control-input" id="input-ner-toggler" :disabled="isLoadingNamedEntities">
          <label class="custom-control-label font-weight-bold" for="input-ner-toggler" id="label-ner-toggler">
            {{ $t('document.showNamedEntities') }}
          </label>
        </div>
        <b-tooltip target="ner-toggler" :title="$t('document.highlights_caution')" />
      </div>
      <hook name="document.content.ner:after" class="d-flex flex-row justify-content-end align-items-center" />
    </div>
    <hook name="document.content.body:before" />
    <div class="document-content__body container-fluid py-3" v-html="transformedContent"></div>
    <hook name="document.content.body:after" />
    <document-attachments :document="document" class="mx-3 mb-3" />
    <hook name="document.content:before" />
  </div>
</template>

<style lang="scss">
  .document-content {

    &__toolbox {
      margin: $spacer $grid-gutter-width * 0.5;
      margin-bottom: 0;
      background: $light;
      position: static;
      top: $spacer;
      left: 0;
      z-index: 50;
      box-shadow: 0 -1 * $spacer 0 0 white;

      &--sticky {
        position: sticky;
      }
    }

    &__ner-toggler {
      & > .custom-control.custom-switch {
        display: inline-block;
      }
    }

    .local-search-term {
      background: #EF0FFF;
      padding: 0;
      color: white;

      &--active {
        background: #38D878;
      }

      > .global-search-term {
        background: transparent;
        color: inherit;
      }
    }
  }
</style>
