<template>
  <div class="document-translated-content" :class="{ 'document-translated-content--original': showOriginal }">
    <template v-if="document.hasTranslationsIn(language)">
      <div class="document-translated-content__translation">
        <div class="document-translated-content__translation__header px-3 py-2">
          <fa icon="globe" class="mr-2" />
          <abbr :title="$t(`facet.lang.${document.translationIn(language).source_language}`)">{{ $t('documentTranslatedContent.detected') }}</abbr>
          <fa icon="angle-right" class="mx-2" />
          <strong>{{ $t(`facet.lang.${language}`) }}</strong>
          <button class="btn btn-sm btn-link ml-3" @click="toggleOriginalContent">
            {{ $t(showOriginal ? 'documentTranslatedContent.viewTranslated' : 'documentTranslatedContent.viewOriginal') }}
          </button>
        </div>
        <div v-html="currentContentHtml" class=" px-3 py-2"></div>
      </div>
    </template>
    <template v-else>
      <div v-html="document.contentHtml"></div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'DocumentTranslatedContent',
  props: ['document'],
  data () {
    return {
      language: 'ENGLISH',
      showOriginal: false
    }
  },
  methods: {
    toggleOriginalContent () {
      this.showOriginal = !this.showOriginal
    }
  },
  computed: {
    currentContentHtml () {
      if (this.showOriginal) {
        return this.document.contentHtml
      } else {
        return this.document.translatedContentHtmlIn(this.language)
      }
    }
  }
}
</script>

<style lang="scss">
  .document-translated-content {

    &__translation {
      background: $translation-bg;
      box-shadow: 0 0 0 2px $translation-bg inset;

      .document-translated-content--original & {
        background: transparent;
      }

      &__header {
        background: $translation-bg;
        color: rgba(darken($translation-bg, 60), 0.5);
      }
    }
  }
</style>
