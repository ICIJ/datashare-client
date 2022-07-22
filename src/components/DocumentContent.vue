<script>
import { findLastIndex, flattenDeep, get, pick, range, throttle } from 'lodash'
import { mapGetters } from 'vuex'

import DocumentAttachments from '@/components/DocumentAttachments'
import DocumentContentSlices from '@/components/DocumentContentSlices'
import DocumentGlobalSearchTermsTags from '@/components/DocumentGlobalSearchTermsTags'
import DocumentLocalSearchInput from '@/components/DocumentLocalSearchInput'
import Hook from '@/components/Hook'
import utils from '@/mixins/utils'
import LocalSearchWorker from '@/utils/local-search.worker'

import { addLocalSearchMarksClassByOffsets } from '@/utils/strings.js'

/**
 * Display a document's extract text after applying a series of transformation with a pipeline.
 */
export default {
  name: 'DocumentContent',
  components: {
    DocumentAttachments,
    DocumentContentSlices,
    DocumentGlobalSearchTermsTags,
    DocumentLocalSearchInput,
    Hook
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
    targetLanguage: {
      type: String,
      default: null
    },
    /**
     * Local search query inside the extracted text.
     */
    q: {
      type: String,
      default: ''
    },
    /**
     * Page size when loading the document in slices
     */
    pageSize: {
      type: Number,
      default: 2500
    }
  },
  data () {
    return {
      hasStickyToolbox: false,
      contentSlices: {},
      localSearchIndex: 0,
      localSearchIndexes: [],
      localSearchOccurrences: 0,
      localSearchTerm: { label: this.q },
      localSearchWorker: null,
      localSearchWorkerInProgress: false,
      rightToLeftLanguages: ['ARABIC', 'HEBREW', 'PERSIAN'],
      maxOffset: 0,
      maxOffsetTranslations: { }
    }
  },
  async mounted () {
    this.maxOffset = await this.getMaxOffset()
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
    localSearchTerm: throttle(async function (t) {
      await this.retrieveTotalOccurrences()
      await this.cookAllContentSlices()
      await this.$nextTick()
      await this.jumpToActiveLocalSearchTerm()
    }, 300),
    async targetLanguage (value) {
      this.maxOffset = await this.getMaxOffset(value)
      await this.cookAllContentSlices()
    }
  },
  methods: {
    async getMaxOffset (targetLanguage = this.targetLanguage) {
      const targetLanguageKey = targetLanguage ?? 'original'
      this.maxOffsetTranslations[targetLanguageKey] ??= await this.$store.dispatch('document/getContentMaxOffset', { targetLanguage })
      return this.maxOffsetTranslations[targetLanguageKey]
    },
    findContentSliceIndexArround (desiredOffset) {
      return findLastIndex(this.offsets, offset => offset <= desiredOffset)
    },
    setContentSlice ({ offset = 0, limit = this.pageSize, targetLanguage = this.targetLanguage, content = '', cookedContent = '' } = {}) {
      const obj = this.contentSlices
      const targetLanguageKey = targetLanguage || 'original'
      // Reactivly set the nested values of contentSlices
      this.$set(obj, offset, obj[offset] || {})
      this.$set(obj[offset], limit, obj[offset][limit] || {})
      this.$set(obj[offset][limit], targetLanguageKey, { content, cookedContent })
      return { content, cookedContent }
    },
    async cookContentSlice ({ offset = 0, limit = this.pageSize, targetLanguage = this.targetLanguage, content = '' } = {}) {
      const contentOffset = offset
      const cookedContent = await this.contentPipeline(content, { contentOffset, ...this.contentPipelineParams })
      this.setContentSlice({ offset, limit, targetLanguage, content, cookedContent })
    },
    cookAllContentSlices () {
      const promises = Object.entries(this.contentSlices).map(([offset, limits]) => {
        return Object.entries(limits).map(([limit, targetLanguages]) => {
          return Object.entries(targetLanguages).map(([targetLanguage, { content }]) => {
            return this.cookContentSlice({ offset, limit, targetLanguage, content })
          })
        })
      })
      return Promise.all(flattenDeep(promises))
    },
    getContentSlice ({ offset = 0, limit = this.pageSize, targetLanguage = this.targetLanguage } = {}) {
      // Ensure the limit is not beyond limit
      limit = Math.min(limit, this.maxOffset - offset)
      const targetLanguageKey = targetLanguage || 'original'
      return get(this.contentSlices, [offset, limit, targetLanguageKey], null)
    },
    hasContentSlice ({ offset = 0, limit = this.pageSize, targetLanguage = this.targetLanguage } = {}) {
      return !!this.getContentSlice({ offset, limit, targetLanguage })
    },
    loadContentSliceArround (desiredOffset) {
      const desiredOffsetIndex = this.findContentSliceIndexArround(desiredOffset)
      const offset = this.offsets[desiredOffsetIndex]
      return this.loadContentSliceOnce({ offset })
    },
    async loadContentSlice ({ offset = 0, limit = this.pageSize, targetLanguage = this.targetLanguage } = {}) {
      // Ensure the limit is not beyond limit
      limit = Math.min(limit, this.maxOffset - offset)
      const { content } = await this.$store.dispatch('document/getContentSlice', { offset, limit, targetLanguage })
      return this.cookContentSlice({ offset, limit, targetLanguage, content })
    },
    async loadContentSliceOnce ({ offset = 0, limit = this.pageSize, targetLanguage = this.targetLanguage } = {}) {
      if (!this.hasContentSlice({ offset, limit, targetLanguage })) {
        await this.loadContentSlice({ offset, limit, targetLanguage })
      }
      return this.getContentSlice({ offset, limit, targetLanguage })
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
    async retrieveTotalOccurrences () {
      try {
        const query = this.localSearchTerm.label
        const targetLanguage = this.targetLanguage
        const { count, offsets } = await this.$store.dispatch('document/searchOccurrences', { query, targetLanguage })
        this.localSearchIndexes = offsets
        this.localSearchOccurrences = count
        this.localSearchIndex = Number(!!count)
      } catch (_) {
        this.localSearchIndexes = []
        this.localSearchOccurrences = 0
      }
    },
    addLocalSearchMarks (content, { contentOffset: delta = 0 } = {}) {
      if (!this.hasLocalSearchTerms) {
        return content
      }

      const offsets = this.localSearchIndexes
      const term = this.localSearchTerm.label
      return addLocalSearchMarksClassByOffsets({ content, term, offsets, delta })
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
    clearActiveLocalSearchTerm () {
      const activeTerms = this.$el.querySelectorAll('.local-search-term--active')
      activeTerms.forEach(term => term.classList.remove('local-search-term--active'))
    },
    scrollToContentSlice (activeTermContentSlice = 0) {
      if (this.$refs?.slices?.scrollToContentSlice) {
        this.$refs?.slices?.scrollToContentSlice(activeTermContentSlice)
      }
    },
    async jumpToActiveLocalSearchTerm () {
      // Delete all existing "local-search-term--active" classes from other element
      this.clearActiveLocalSearchTerm()
      const activeTermOffset = this.localSearchIndexes[this.localSearchIndex - 1]
      // Load missing content slice (if needed)
      this.loadContentSliceArround(activeTermOffset)
      // Move to the content slice containing the term
      const activeTermContentSlice = this.findContentSliceIndexArround(activeTermOffset)
      this.scrollToContentSlice(activeTermContentSlice)
      // Find the active search term according to `localSearchIndex`
      const activeTermSelector = `.local-search-term[data-offset="${activeTermOffset}"]`
      const activeTerm = this.$el.querySelector(activeTermSelector)
      // Add the correct class and scroll the element into view
      activeTerm?.classList.add('local-search-term--active')
      activeTerm?.scrollIntoView({ block: 'center', inline: 'nearest' })
    },
    onContentSlicePlaceholderVisible ({ offset, limit }) {
      return this.loadContentSliceOnce({ offset, limit })
    },
    getContentSlicePageOffset (page) {
      return (page - 1) * this.pageSize
    },
    getVirtualContentSlicePlaceholder (page) {
      const id = `document-content-slice-placeholder-${page}`
      const limit = this.pageSize
      const offset = this.getContentSlicePageOffset(page)
      const placeholder = true
      return { placeholder, id, offset, limit }
    },
    getVirtualContentSlice (page) {
      const offset = this.getContentSlicePageOffset(page)
      // To return the actual content slice, the content must exists
      if (this.hasContentSlice({ offset })) {
        const { pageSize: limit, targetLanguage } = this
        // Share the content in a getter function to avoid copying huge
        // chunks of text into each virtual slice
        const get = this.getContentSlice.bind(this)
        const id = `document-content-slice-${page}`
        return { id, get, offset, limit, targetLanguage }
      }
      return this.getVirtualContentSlicePlaceholder(page)
    }
  },
  computed: {
    ...mapGetters('pipelines', {
      getPipelineChain: 'applyPipelineChainByCategory',
      getFullPipelineChain: 'getFullPipelineChainByCategory'
    }),
    ...mapGetters('search', {
      globalSearchTerms: 'retrieveContentQueryTerms'
    }),
    isRightToLeft () {
      const language = get(this.document, 'source.language', null)
      return this.rightToLeftLanguages.includes(language)
    },
    contentPipelineFunctions () {
      return this.getFullPipelineChain('extracted-text')
    },
    offsets () {
      return range(0, this.maxOffset, this.pageSize)
    },
    virtualContentSlices () {
      return this.offsets.map((_, index) => {
        return this.getVirtualContentSlice(index + 1)
      })
    },
    contentPipeline () {
      return this.getPipelineChain('extracted-text', this.addLocalSearchMarks)
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
    <document-content-slices
      :class="{ 'document-content__body--rtl': isRightToLeft }"
      :slices="virtualContentSlices"
      @placeholder-visible="onContentSlicePlaceholderVisible"
      class="document-content__body container-fluid py-3"
      ref="slices" />
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
