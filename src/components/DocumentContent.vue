<script>
import xss from 'xss'
import compact from 'lodash/compact'
import identity from 'lodash/identity'
import sortedUniqBy from 'lodash/sortedUniqBy'
import template from 'lodash/template'
import throttle from 'lodash/throttle'
import trim from 'lodash/trim'
import { mapGetters } from 'vuex'

import { highlight } from '@/utils/strings'
import ner from '@/mixins/ner'
import utils from '@/mixins/utils'

import DocumentTranslatedContent from '@/components/DocumentTranslatedContent.vue'
import DocumentGlobalSearchTermsTags from '@/components/DocumentGlobalSearchTermsTags.vue'
import DocumentLocalSearchInput from '@/components/DocumentLocalSearchInput.vue'

export default {
  name: 'DocumentContent',
  components: {
    DocumentTranslatedContent,
    DocumentGlobalSearchTermsTags,
    DocumentLocalSearchInput
  },
  mixins: [ner, utils],
  props: {
    document: {
      type: Object
    },
    namedEntities: {
      type: Array,
      default: () => ([])
    },
    translatedContent: {
      type: String
    }
  },
  data () {
    return {
      contentTransformed: '',
      localSearchIndex: 0,
      localSearchOccurrences: 0,
      localSearchTerm: '',
      hasStickyToolbox: false,
      showNamedEntities: true
    }
  },
  async mounted () {
    this.contentTransformed = await this.contentPipeline()
  },
  watch: {
    localSearchTerm: throttle(async function () {
      this.contentTransformed = await this.contentPipeline()
      this.$nextTick(this.jumpToActiveLocalSearchTerm)
    }, 300),
    async showNamedEntities () {
      this.contentTransformed = await this.contentPipeline()
    },
    async translatedContent () {
      this.contentTransformed = await this.contentPipeline()
    }
  },
  methods: {
    buildNamedEntityMark (ne) {
      const extractor = ne.source.extractor
      const mention = ne.source.mention
      const classNames = this.getCategoryClass(ne.source.category, 'ner--')
      return this.namedEntityMarkTemplate({ classNames, extractor, mention })
    },
    addNamedEntitiesMarks (content) {
      const sortedNamedEntities = sortedUniqBy(this.namedEntities, ne => ne.source.offset)
      return highlight(content, sortedNamedEntities, this.buildNamedEntityMark, identity, m => m.source.mention)
    },
    addGlobalSearchMarks (content) {
      return this.globalSearchTermsInContent(content).reduce((content, term, index) => {
        const needle = new RegExp(term.label, 'gi')
        const fn = match => `<mark style="border-color: ${this.getTermIndexColor(index)}">${match}</mark>`
        return content.replace(needle, fn)
      }, content)
    },
    addLocalSearchMarks (content) {
      if (this.localSearchTerm.length === 0) return content

      this.localSearchOccurrences = (content.match(new RegExp('(?![^<]*>)' + this.localSearchTerm, 'gi')) || []).length
      this.localSearchIndex = Number(!!this.localSearchOccurrences)

      if (this.localSearchOccurrences === 0) return content

      const needle = RegExp(`^(?:[\\s\\S]*?(?![^<]*>)(${this.localSearchTerm}))`, 'gim')
      return content.replace(needle, (match, p1) => {
        return match.replace(p1, `<mark class="local-search-term">${p1}</mark>`)
      })
    },
    addLineBreaks (content) {
      return trim(content).split('\n').map(row => `<p>${row}</p>`).join('')
    },
    sanitizeHtml (content) {
      const whiteList = { mark: ['style', 'class', 'title'], p: true }
      return xss(content, { stripIgnoreTag: true, whiteList })
    },
    // The pipeline that transforms the content must be asynchrone
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
        activeSearchTerm.scrollIntoView({ block: 'center', inline: 'nearest' })
        activeSearchTerm.classList.add('local-search-term--active')
      }
    }
  },
  computed: {
    contentPipelineFunctions () {
      return compact([
        // Named entities cannot be added on translated content
        (this.shouldApplyNamedEntitiesMarks ? this.addNamedEntitiesMarks : null),
        this.addLocalSearchMarks,
        this.addGlobalSearchMarks,
        this.sanitizeHtml,
        this.addLineBreaks
      ])
    },
    showNamedEntitiesToggler () {
      return !this.translatedContent && !!this.namedEntities.length
    },
    shouldApplyNamedEntitiesMarks () {
      return !this.translatedContent && this.showNamedEntities
    },
    namedEntityMarkTemplate () {
      return template('<mark class="ner <%= classNames %>" title="<%= extractor %>"><%= mention %></mark>')
    },
    ...mapGetters('search', {
      globalSearchTerms: 'retrieveContentQueryTerms',
      globalSearchTermsInContent: 'retrieveContentQueryTermsInContent'
    }),
    content () {
      return this.translatedContent || this.document.source.content
    }
  }
}
</script>

<template>
  <div class="document-content">
    <div class="document-content__toolbox d-flex" :class="{ 'document-content__toolbox--sticky': hasStickyToolbox }">
      <document-global-search-terms-tags :document="document" class="p-3 w-100" />
      <document-local-search-input class="ml-auto" :document="document" v-model="localSearchTerm" @next="findNextLocalSearchTerm" @previous="findPreviousLocalSearchTerm" :search-occurrences="localSearchOccurrences" :search-index="localSearchIndex" v-bind:activated.sync="hasStickyToolbox" />
    </div>
    <div class="document-content__ner-toggler" v-if="showNamedEntitiesToggler">
      <div class="custom-control custom-switch">
        <input type="checkbox" v-model="showNamedEntities" class="custom-control-input" id="input-ner-toggler">
        <label class="custom-control-label font-weight-bold" for="input-ner-toggler" id="label-ner-toggler">
          {{ $t('document.see_highlights') }}
        </label>
      </div>
      <b-tooltip placement="bottom" target="label-ner-toggler" :title="$t('document.highlights_caution')" />
    </div>
    <div class="document-content__body container-fluid">
      <div v-html="contentTransformed" class="py-3"></div>
    </div>
  </div>
</template>

<style lang="scss">
  .document-content {

    &__toolbox {
      margin: $spacer $grid-gutter-width * 0.5;
      margin-bottom: 0;
      background: $light;
      position: static;
      top: var(--search-document-navbar-height);
      left: 0;
      z-index: 50;

      &--sticky {
        position: sticky;
      }
    }

    &__ner-toggler {
      float: right;
      margin: $spacer * 0.25 $spacer $spacer;

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
    }
  }
</style>
