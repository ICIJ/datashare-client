<template>
  <div class="document-translated-content" :class="{ 'document-translated-content--original': !showTranslatedContent }">
    <template v-if="hasTranslations && !useContentTextLazyLoading">
      <div class="document-translated-content__translation m-3">
        <div class="document-translated-content__translation__header px-3 py-2">
          <fa icon="globe" class="mr-2" />
          <abbr :title="$t(`filter.lang.${document.source.language}`)" v-if="translation.source_language === document.source.language">{{ $t('documentTranslatedContent.detected') }}</abbr>
          <span v-else>
            {{ $t(`filter.lang.${translation.source_language}`) }}
          </span>
          <fa icon="angle-right" class="mx-2" />
          <strong :title="`Translated with ${translation.translator}`">
            {{ $t(`filter.lang.${language}`) }}
          </strong>
          <button class="btn btn-sm btn-link ml-3" @click="toggleTranslatedContent">
            {{ $t(showTranslatedContent ? 'documentTranslatedContent.viewOriginal' : 'documentTranslatedContent.viewTranslated') }}
          </button>
        </div>
        <document-content ref="content" class="document-translated-content__translation__header__content" :document="document" :q="q" :content-translation="contentTranslation" />
      </div>
    </template>
    <template v-else>
      <document-content ref="content" class="document-translated-content__original" :document="document" :q="q" />
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { find, join } from 'lodash'
import elasticsearch from '@/api/elasticsearch'
import DocumentContent from '@/components/DocumentContent'

/**
 * Displayed document text content and it's translated alternatives.
 */
export default {
  name: 'DocumentTranslatedContent',
  props: {
    /**
     * The selected document.
     */
    document: {
      type: Object
    },
    /**
     * Local search query inside the extracted text.
     */
    q: {
      type: String,
      default: ''
    }
  },
  components: {
    DocumentContent
  },
  data () {
    return {
      language: 'ENGLISH',
      translations: []
    }
  },
  async mounted () {
    await this.loadAvailableTranslations()
  },
  methods: {
    toggleTranslatedContent () {
      this.$store.commit('document/toogleShowTransatedContent')
    },
    async loadAvailableTranslations () {
      const _source = join([
        'content_translated.source_language',
        'content_translated.target_language',
        'content_translated.translator'
      ])
      const { index, id, routing } = this.document
      const data = await elasticsearch.getSource({ index, id, routing, _source })
      this.$set(this, 'translations', data.content_translated)
    }
  },
  computed: {
    ...mapState('document', [
      'useContentTextLazyLoading',
      'showTranslatedContent'
    ]),
    contentTranslation () {
      if (this.showTranslatedContent) {
        return this.language
      }
      return null
    },
    hasTranslations () {
      return !!this.translation
    },
    translation () {
      return find(this.translations, { target_language: this.language })
    }
  }
}
</script>

<style lang="scss">
  .document-translated-content {
    &__translation {
      box-shadow: 0 0 0 3px $translation-bg inset;

      .document-translated-content--original & {
        box-shadow: none;

        &__header {
          background: transparent;
        }
      }

      &__header {
        background: $translation-bg;
        color: rgba(darken($translation-bg, 70), 0.7);
      }
    }
  }
</style>
