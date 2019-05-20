<template>
  <div class="p-3">
    <ul class="list-unstyled">
      <li v-for="(translation, index) in document.translationsHtml" class="card mb-4" :key="index">
        <div class="mb-2 bg-light p-2">
          <span class="text-muted">
            {{ $t('facet.lang.' + translation.source_language) }}
          </span>
          <fa icon="angle-right" />
          <span class="font-weight-bold">
            {{ $t('facet.lang.' + translation.target_language) }}
          </span>
        </div>
        <div class="p-2" v-html="translation.content"></div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'DocumentTabTranslations',
  props: ['document'],
  computed: {
    ...mapState('search', ['query']),
    ...mapState('document', ['showNamedEntities'])
  }
}
</script>
