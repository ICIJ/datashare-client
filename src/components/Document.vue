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

      <dt v-if="document.source.metadata.tika_metadata_creation_date">{{ $t('file.creation_date') }}</dt>
      <dd v-if="document.source.metadata.tika_metadata_creation_date">{{ creationDate }}</dd>
      <dt v-if="document.source.contentLength !== '-1'">{{ $t('file.size') }}</dt>
      <dd v-if="document.source.contentLength !== '-1'">{{ document.source.contentLength }}</dd>
      <dt v-if="document.source.language !== 'UNKNOWN'">{{ $t('file.content_language') }}</dt>
      <dd v-if="document.source.language !== 'UNKNOWN'">{{ document.source.language }}</dd>
      <dt v-if="document.source.contentType !== 'unknown'">{{ $t('file.content_type') }}</dt>
      <dd v-if="document.source.contentType !== 'unknown'">{{ document.source.contentType }}</dd>
      <dt v-if="document.source.contentEncoding !== 'unknown'">{{ $t('file.content_encoding') }}</dt>
      <dd v-if="document.source.contentEncoding !== 'unknown'">{{ document.source.contentEncoding }}</dd>
      <dt v-if="document.source.extractionLevel > 0">{{ $t('file.tree_level') }}</dt>
      <dd v-if="document.source.extractionLevel > 0">{{ document.source.extractionLevel }}</dd>
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
