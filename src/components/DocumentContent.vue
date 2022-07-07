<script>
import { once, pick, throttle, uniqueId, get, noop } from 'lodash'
import { mapGetters, mapState } from 'vuex'

import DocumentAttachments from '@/components/DocumentAttachments'
import DocumentGlobalSearchTermsTags from '@/components/DocumentGlobalSearchTermsTags'
import DocumentLocalSearchInput from '@/components/DocumentLocalSearchInput'
import Hook from '@/components/Hook'
import utils from '@/mixins/utils'
import LocalSearchWorker from '@/utils/local-search.worker'
import InfiniteLoading from 'vue-infinite-loading'

/**
 * Display a document's extract text after applying a series of transformation with a pipeline.
 */
export default {
  name: 'DocumentContent',
  components: {
    DocumentAttachments,
    DocumentGlobalSearchTermsTags,
    DocumentLocalSearchInput,
    Hook,
    InfiniteLoading
  },
  mixins: [utils],
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    },
    /**
     * The language to translate the content to
     */
    contentTranslation: {
      type: String,
      default: null
    },
    /**
     * Local search query inside the extracted text.
     */
    q: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      hasStickyToolbox: false,
      localSearchIndex: 0,
      localSearchOccurrences: 0,
      localSearchTerm: { label: this.q },
      localSearchWorker: null,
      localSearchWorkerInProgress: false,
      transformedContent: '',
      rightToLeftLanguages: ['ARABIC', 'HEBREW', 'PERSIAN'],
      infiniteScrollId: uniqueId('infinite-scroll-'),
      offset: 0,
      maxOffset: 0,
      maxOffsetTranslations: { },
      pageSize: 2500
    }
  },
  async mounted () {
    // Apply the transformation pipeline once
    await this.transformContent()
    // Initial local query, we need to jump to the result
    if (this.q) {
      this.hasStickyToolbox = true
      this.$nextTick(this.jumpToActiveLocalSearchTerm)
    }
  },
  beforeDestroy () {
    this.terminateLocalSearchWorker()
  },
  watch: {
    localSearchTerm: throttle(async function () {
      await this.transformContent()
      this.$nextTick(this.jumpToActiveLocalSearchTerm)
    }, 300),
    async contentTranslation (value) {
      this.offset = 0
      this.maxOffset = await this.getMaxOffset(value)
      return this.transformContent()
    },
    contentPipelineFunctions () {
      return this.transformContent()
    },
    useContentTextLazyLoading (value) {
      this.transformContent()
    }
  },
  methods: {
    replaceBetween (origin, start, end, what) {
      return origin.substring(0, start) + what + origin.substring(end)
    },
    async getMaxOffset (contentTranslation) {
      const currentContent = contentTranslation ?? 'original'
      this.maxOffsetTranslations[currentContent] ??= await this.$store.dispatch('document/getContentMaxOffset', { targetLanguage: contentTranslation })
      return this.maxOffsetTranslations[currentContent]
    },
    async loadContent () {
      if (!this.useContentTextLazyLoading && !this.document.hasContent) {
        await this.$store.dispatch('document/getContent')
      }
      if (this.useContentTextLazyLoading) {
        if (!this.document.hasContent) {
          this.offset = 0
          this.maxOffset = await this.getMaxOffset(this.contentTranslation)
        }
        const slice = await this.$store.dispatch('document/getContentSlice', { offset: this.offset, limit: this.actualPageSize, targetLanguage: this.contentTranslation })

        if (!this.reachedTheEnd && this.offset !== this.actualNextOffset) {
          const end = slice.offset + slice.limit
          const content = this.replaceBetween(this.content, slice.offset, end, slice.content)
          this.$store.dispatch('document/setContent', content)
          this.offset = this.actualNextOffset
        }
      }
      this.$root.$emit('document::content-loaded')

      return this.content
    },
    async transformContent () {
      const transformedContent = await this.applyContentPipeline()
      const body = this.$el.querySelector('.document-content__body')
      if (this.rightToLeftLanguages.includes(this.document.source.language)) {
        body.classList.add('document-content__body--rtl')
      }
      this.$set(this, 'transformedContent', transformedContent)
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
    addLocalSearchMarks (content) {
      if (!this.hasLocalSearchTerms) {
        return content
      }

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

      this.localSearchWorker.postMessage({ content, localSearchTerm: this.localSearchTerm })

      return workerPromise
    },
    async applyContentPipeline () {
      const content = await this.loadContent()
      return this.contentPipeline(content, this.contentPipelineParams)
    },
    findNextLocalSearchTerm () {
      const localSearchIndex = Math.min(this.localSearchOccurrences, this.localSearchIndex + 1)
      this.$set(this, 'localSearchIndex', localSearchIndex)
      this.$nextTick(this.jumpToActiveLocalSearchTerm)
    },
    findPreviousLocalSearchTerm () {
      const localSearchIndex = Math.max(1, this.localSearchIndex - 1)
      this.$set(this, 'localSearchIndex', localSearchIndex)
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
    async nextLoadData ($infiniteLoadingState) {
      await this.transformContent()
      // Did we reach the end?
      const method = this.reachedTheEnd ? 'complete' : 'loaded'
      // Call the right method (with "noop" as safety net in case the method can't be found)
      return get($infiniteLoadingState, method, noop)()
    }
  },
  computed: {
    ...mapState('document', ['isTranslatedContentLoaded', 'useContentTextLazyLoading']),
    ...mapGetters('pipelines', {
      getPipelineChain: 'applyPipelineChainByCategory',
      getFullPipelineChain: 'getFullPipelineChainByCategory'
    }),
    ...mapGetters('search', {
      globalSearchTerms: 'retrieveContentQueryTerms'
    }),
    contentPipelineFunctions () {
      return this.getFullPipelineChain('extracted-text')
    },
    translatedContent () {
      if (this.isTranslatedContentLoaded && this.contentTranslation !== null) {
        return this.document.translatedContentIn(this.contentTranslation)
      }
      return null
    },
    content: {
      // Document's content is not a reactive property yet so we cannot use
      // vue caching mechanism here.
      cache: false,
      get () {
        return this.translatedContent || this.document.content || ''
      }
    },
    contentPipeline () {
      return this.getPipelineChain('extracted-text', ...[
        this.addLocalSearchMarks
      ])
    },
    contentPipelineParams () {
      return pick(this, [
        'hasStickyToolbox',
        'globalSearchTerms',
        'localSearchIndex',
        'localSearchOccurrences',
        'localSearchTerm',
        'localSearchWorkerInProgress'
      ])
    },
    hasLocalSearchTerms () {
      return this.localSearchTerm.label && this.localSearchTerm.label.length > 0
    },
    reachedTheEnd () {
      return this.offset >= this.maxOffset && this.useContentTextLazyLoading
    },
    nextOffset () {
      return this.offset + this.pageSize
    },
    actualNextOffset () {
      return this.nextOffset > this.maxOffset ? this.maxOffset : this.nextOffset
    },
    lastPageSize () {
      return this.maxOffset % this.pageSize
    },
    actualPageSize () {
      return this.nextOffset > this.maxOffset ? this.lastPageSize : this.pageSize
    },
    useInfiniteScroll () {
      return this.infiniteScrollId && this.offset > 0 && !this.reachedTheEnd
    }
  }
}
</script>

<template>
  <div class="document-content">
    <hook name="document.content:before"></hook>
      <div class="document-content__toolbox d-flex" :class="{ 'document-content__toolbox--sticky': hasStickyToolbox }">
        <hook name="document.content.toolbox:before"></hook>
        <document-global-search-terms-tags
          :document="document"
          @select="localSearchTerm = $event"
          class="p-3 w-100"></document-global-search-terms-tags>
        <document-local-search-input class="ml-auto"
          v-model="localSearchTerm"
          v-bind:activated.sync="hasStickyToolbox"
          @next="findNextLocalSearchTerm"
          @previous="findPreviousLocalSearchTerm"
          :search-occurrences="localSearchOccurrences"
          :search-index="localSearchIndex"
          :search-worker-in-progress="localSearchWorkerInProgress"></document-local-search-input>
        <hook name="document.content.toolbox:after"></hook>
      </div>
      <div class="document-content__togglers d-flex flex-row justify-content-end align-items-center px-3">
        <!-- @deprecated The hooks "document.content.ner" are now deprecated. The "document.content.togglers" hooks should be used instead. -->
        <hook name="document.content.ner:before" class="d-flex flex-row justify-content-end align-items-center"></hook>
        <hook name="document.content.togglers:before" class="d-flex flex-row justify-content-end align-items-center"></hook>
        <hook name="document.content.togglers:after" class="d-flex flex-row justify-content-end align-items-center"></hook>
        <hook name="document.content.ner:after" class="d-flex flex-row justify-content-end align-items-center"></hook>
      </div>
      <hook name="document.content.body:before"></hook>
      <div class="document-content__body container-fluid py-3" v-html="transformedContent"></div>
      <infinite-loading @infinite="nextLoadData" v-if="useInfiniteScroll" :identifier="infiniteScrollId">
          <span slot="spinner"></span>
          <span slot="no-more"></span>
          <span slot="no-results"></span>
      </infinite-loading>
      <hook name="document.content.body:after"></hook>
      <document-attachments :document="document" class="mx-3 mb-3"></document-attachments>
    <hook name="document.content:after"></hook>
  </div>
</template>

<style lang="scss" scoped>
  .document-content {
    &__toolbox {
      background: $lighter;
      box-shadow: 0 -1 * $spacer 0 0 white;
      left: 0;
      margin: $spacer $grid-gutter-width * 0.5;
      margin-bottom: 0;
      position: static;
      top: $spacer;
      z-index: 50;

      &--sticky {
        position: sticky;
      }
    }

    &__body--rtl {
      direction: rtl;
      text-align: right;
    }

    & /deep/ mark {
      padding: 0;
    }

    & /deep/ .local-search-term {
      background: $mark-bg;
      color: black;
      padding: 0;

      &--active {
        background: #38D878;
        color: white;
      }

      > .global-search-term {
        background: transparent;
        color: inherit;
        border-bottom: 2px solid transparent;
        padding: 0;
      }
    }
  }
</style>
