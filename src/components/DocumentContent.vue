<script>
import once from 'lodash/once'
import pick from 'lodash/pick'
import throttle from 'lodash/throttle'
import { mapGetters, mapState } from 'vuex'

import ContentTextLengthWarning from '@/components/ContentTextLengthWarning'
import DocumentAttachments from '@/components/DocumentAttachments'
import DocumentGlobalSearchTermsTags from '@/components/DocumentGlobalSearchTermsTags'
import DocumentLocalSearchInput from '@/components/DocumentLocalSearchInput'
import Hook from '@/components/Hook'
import ner from '@/mixins/ner'
import utils from '@/mixins/utils'
import LocalSearchWorker from '@/utils/local-search.worker'

/**
 * Display a document's extract text after applying a series of transformation with a pipeline.
 */
export default {
  name: 'DocumentContent',
  components: {
    ContentTextLengthWarning,
    DocumentAttachments,
    DocumentGlobalSearchTermsTags,
    DocumentLocalSearchInput,
    Hook
  },
  mixins: [ner, utils],
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
  beforeDestroy () {
    this.terminateLocalSearchWorker()
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
      return await this.transformContent()
    },
    contentTranslation () {
      return this.transformContent()
    },
    contentPipelineFunctions () {
      return this.transformContent()
    },
    showContentTextLengthWarning () {
      this.transformContent()
    }
  },
  methods: {
    async loadContent () {
      if (!this.showContentTextLengthWarning && !this.document.hasContent) {
        await this.$store.dispatch('document/getContent')
      }
      return this.content
    },
    async transformContent () {
      const transformedContent = await this.applyContentPipeline()
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
    getNamedEntitiesTotal () {
      return this.$store.dispatch('document/getNamedEntitiesTotal')
    }
  },
  computed: {
    ...mapState('document', ['isLoadingNamedEntities', 'showContentTextLengthWarning']),
    ...mapGetters('document', ['namedEntities']),
    ...mapGetters('pipelines', {
      getPipelineChain: 'applyPipelineChainByCategory',
      getFullPipelineChain: 'getFullPipelineChainByCategory'
    }),
    ...mapGetters('search', {
      globalSearchTerms: 'retrieveContentQueryTerms'
    }),
    showNamedEntities: {
      set (toggle) {
        this.$store.commit('document/toggleShowNamedEntities', toggle)
      },
      get () {
        return this.$store.state.document.showNamedEntities
      }
    },
    contentPipelineFunctions () {
      return this.getFullPipelineChain('extracted-text')
    },
    showNamedEntitiesToggle () {
      return !this.translatedContent && this.hasNamedEntities
    },
    shouldApplyNamedEntitiesMarks () {
      return !this.translatedContent && this.showNamedEntities
    },
    translatedContent () {
      if (this.contentTranslation !== null) {
        return this.document.translatedContentIn(this.contentTranslation)
      }
      return null
    },
    content: {
      // Document's content is not a reactive property yet so we cannot use
      // vue caching mecanism here.
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
        'localSearchWorkerInProgress',
        'namedEntities',
        'shouldApplyNamedEntitiesMarks'
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
    <content-text-length-warning v-if="showContentTextLengthWarning" />
    <template v-else>
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
      <div class="d-flex flex-row justify-content-end align-items-center px-3">
        <hook name="document.content.ner:before" class="d-flex flex-row justify-content-end align-items-center"></hook>
        <div class="document-content__ner-toggler py-1 ml-3 font-weight-bold" id="ner-toggler" v-if="showNamedEntitiesToggle">
          <div class="custom-control custom-switch">
            <input type="checkbox" v-model="showNamedEntities" class="custom-control-input" id="input-ner-toggler" :disabled="isLoadingNamedEntities">
            <label class="custom-control-label font-weight-bold" for="input-ner-toggler" id="label-ner-toggler">
              {{ $t('document.showNamedEntities') }}
            </label>
          </div>
          <b-tooltip target="ner-toggler" :title="$t('document.highlightsCaution')"></b-tooltip>
        </div>
        <hook name="document.content.ner:after" class="d-flex flex-row justify-content-end align-items-center"></hook>
      </div>
      <hook name="document.content.body:before"></hook>
      <div class="document-content__body container-fluid py-3" v-html="transformedContent"></div>
      <hook name="document.content.body:after"></hook>
      <document-attachments :document="document" class="mx-3 mb-3"></document-attachments>
    </template>
    <hook name="document.content:after"></hook>
  </div>
</template>

<style lang="scss">
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

    &__ner-toggler {
      & > .custom-control.custom-switch {
        display: inline-block;
      }
    }

    .local-search-term {
      background: #F1C40F;
      color: black;
      padding: 0;

      &--active {
        background: #38D878;
        color: white;
      }

      > .global-search-term {
        background: transparent;
        color: inherit;
      }
    }
  }
</style>
