<template>
  <div class="document container py-4" v-if="document">
    <h3>{{ document.basename }}</h3>
    <div class="document__meta">
      <dl class="row">
        <dt class="col-sm-3">{{ $t('file.name') }}</dt>
        <dd class="col-sm-9">{{ document.basename }}</dd>
        <dt class="col-sm-3">{{ $t('file.path') }}</dt>
        <dd class="col-sm-9">{{ document.source.path }}</dd>
        <dt class="col-sm-3">{{ $t('file.id') }}</dt>
        <dd class="col-sm-9">{{ document.id }}</dd>

        <template v-if="document.source.metadata.tika_metadata_creation_date">
          <dt class="col-sm-3">{{ $t('file.creation_date') }}</dt>
          <dd class="col-sm-9">{{ creationDate }}</dd>
        </template>
        <template v-if="document.source.contentLength !== -1">
          <dt class="col-sm-3">{{ $t('file.size') }}</dt>
          <dd class="col-sm-9">{{ document.humanSize }}</dd>
        </template>
        <template v-if="document.source.language !== 'UNKNOWN'">
          <dt class="col-sm-3">{{ $t('file.content_language') }}</dt>
          <dd class="col-sm-9">{{ document.source.language }}</dd>
        </template>
        <template v-if="document.source.contentType !== 'unknown'">
          <dt class="col-sm-3">{{ $t('file.content_type') }}</dt>
          <dd class="col-sm-9">{{ document.source.contentType }}</dd>
        </template>
        <template v-if="document.source.contentEncoding !== 'unknown'">
          <dt class="col-sm-3">{{ $t('file.content_encoding') }}</dt>
          <dd class="col-sm-9">{{ document.source.contentEncoding }}</dd>
        </template>
        <template v-if="document.source.extractionLevel > 0">
          <dt class="col-sm-3">{{ $t('file.tree_level') }}</dt>
          <dd class="col-sm-9">{{ document.source.extractionLevel }}</dd>
        </template>
      </dl>
    </div>
    <div class="document__text">
      {{document.source.content}}
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import client from '@/api/client'

export default {
  name: 'document-view',
  props: ['id', 'routing'],
  data () {
    return {
      document: null
    }
  },
  methods: {
    setDoc (err, document) {
      if (!err) {
        this.$set(this, 'document', document)
      }
    }
  },
  computed: {
    creationDate () {
      return moment(this.document.source.metadata.tika_metadata_creation_date).format('LLL')
    }
  },
  beforeRouteUpdate (to, from, next) {
    client.getEsDoc(to.params.id, to.query.routing, (error, document) => {
      this.setDoc(error, document)
      next()
    })
  },
  beforeRouteEnter (to, from, next) {
    client.getEsDoc(to.params.id, to.query.routing, (error, document) => {
      next(error ? false : vm => { vm.setDoc(null, document) })
    })
  }
}
</script>

<style lang="scss">
.document {
  .document__text {
    white-space: pre;
  }
}
</style>
