<template>
  <div class="document container py-4" v-if="document">
    <h3>{{ document.basename }}</h3>
    <nav>
      <div class="nav nav-tabs">
        <router-link :to="{ name: 'document', params: { id: document.id, tab:'details'}, query: { routing: document.routing }}" class="nav-item nav-link" v-bind:class="{active: activeTab === 'details'}">
          {{$t('document.details')}}
        </router-link>
        <router-link :to="{ name: 'document', params: { id: document.id, tab:'text'}, query: { routing: document.routing }}" class="nav-item nav-link" v-bind:class="{active: activeTab === 'text'}">
          {{$t('document.extracted_text')}}
        </router-link>
        <router-link :to="{ name: 'document', params: { id: document.id, tab:'preview'}, query: { routing: document.routing }}" class="nav-item nav-link" v-bind:class="{active: activeTab === 'preview'}">
          {{$t('document.preview')}}
        </router-link>
      </div>
    </nav>
    <div class="tab-content">
      <div class="tab-pane" v-bind:class="{active: activeTab === 'details'}">
        <dl class="row">
          <dt class="col-sm-3">{{ $t('document.name') }}</dt>
          <dd class="col-sm-9">{{ document.basename }}</dd>
          <dt class="col-sm-3">{{ $t('document.path') }}</dt>
          <dd class="col-sm-9">{{ document.source.path }}</dd>
          <dt class="col-sm-3">{{ $t('document.id') }}</dt>
          <dd class="col-sm-9">{{ document.id }}</dd>

          <template v-if="document.source.metadata.tika_metadata_creation_date">
            <dt class="col-sm-3">{{ $t('document.creation_date') }}</dt>
            <dd class="col-sm-9">{{ creationDate }}</dd>
          </template>
          <template v-if="document.source.contentLength !== -1">
            <dt class="col-sm-3">{{ $t('document.size') }}</dt>
            <dd class="col-sm-9">{{ document.humanSize }}</dd>
          </template>
          <template v-if="document.source.language !== 'UNKNOWN'">
            <dt class="col-sm-3">{{ $t('document.content_language') }}</dt>
            <dd class="col-sm-9">{{ document.source.language }}</dd>
          </template>
          <template v-if="document.source.contentType !== 'unknown'">
            <dt class="col-sm-3">{{ $t('document.content_type') }}</dt>
            <dd class="col-sm-9">{{ document.source.contentType }}</dd>
          </template>
          <template v-if="document.source.contentEncoding !== 'unknown'">
            <dt class="col-sm-3">{{ $t('document.content_encoding') }}</dt>
            <dd class="col-sm-9">{{ document.source.contentEncoding }}</dd>
          </template>
          <template v-if="document.source.extractionLevel > 0">
            <dt class="col-sm-3">{{ $t('document.tree_level') }}</dt>
            <dd class="col-sm-9">{{ document.source.extractionLevel }}</dd>
          </template>
        </dl>
      </div>
      <div class="tab-pane text-pre-wrap" v-bind:class="{active: activeTab === 'text'}">
        {{document.source.content}}
      </div>
      <div class="tab-pane" v-bind:class="{active: activeTab === 'preview'}">
        Not available
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import {mapState} from 'vuex'

export default {
  name: 'document-view',
  props: ['id', 'tab'],
  methods: {
    getDoc () {
      return this.$store.dispatch('document/get', this.id)
    }
  },
  computed: {
    creationDate () {
      return moment(this.document.source.metadata.tika_metadata_creation_date).format('LLL')
    },
    activeTab () {
      return this.tab === undefined ? 'details' : this.tab
    },
    ...mapState('document', {
      document: state => state.doc
    })
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.getDoc())
  },
  beforeRouteUpdate (to, from, next) {
    this.getDoc()
    next()
  }
}
</script>

<style lang="scss">
.text-pre-wrap {
  white-space: pre-wrap;
}
</style>
