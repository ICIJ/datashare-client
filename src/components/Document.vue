<template>
  <div class="document container py-4" v-if="document">
    <h3>{{ document.basename }}</h3>
    <dl>
      <dt>{{ $t('file.name') }}</dt>
      <dd>{{ document.basename }}</dd>
      <dt>{{ $t('file.path') }}</dt>
      <dd>{{ document.source.path }}</dd>
      <dt>{{ $t('file.id') }}</dt>
      <dd>{{ document.id }}</dd>

      <template v-if="document.source.metadata.tika_metadata_creation_date">
        <dt>{{ $t('file.creation_date') }}</dt>
        <dd>{{ creationDate }}</dd>
      </template>
      <template v-if="document.source.contentLength !== '-1'">
        <dt>{{ $t('file.size') }}</dt>
        <dd>{{ document.source.contentLength }}</dd>
      </template>
      <template v-if="document.source.language !== 'UNKNOWN'">
        <dt>{{ $t('file.content_language') }}</dt>
        <dd>{{ document.source.language }}</dd>
      </template>
      <template v-if="document.source.contentType !== 'unknown'">
        <dt>{{ $t('file.content_type') }}</dt>
        <dd>{{ document.source.contentType }}</dd>
      </template>
      <template v-if="document.source.contentEncoding !== 'unknown'">
        <dt>{{ $t('file.content_encoding') }}</dt>
        <dd>{{ document.source.contentEncoding }}</dd>
      </template>
      <template v-if="document.source.extractionLevel > 0">
        <dt>{{ $t('file.tree_level') }}</dt>
        <dd>{{ document.source.extractionLevel }}</dd>
      </template>
    </dl>
  </div>
</template>

<script>
import moment from 'moment'
import client from '@/api/client'

export default {
  name: 'Document',
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
