<template>
  <div class="document container py-4" v-if="document">
    <h3>{{ document.basename }}</h3>
    <nav>
      <div class="nav nav-tabs">
        <router-link :to="{ name: 'document', params: { id: document.id, routing: document.routing}, query: { tab: 'details' }}" class="nav-item nav-link" v-bind:class="{active: tab === 'details'}">
          {{$t('document.details')}}
        </router-link>
        <router-link :to="{ name: 'document', params: { id: document.id, routing: document.routing}, query: { tab: 'text' }}" class="nav-item nav-link" v-bind:class="{active: tab === 'text'}">
          {{$t('document.extracted_text')}}
        </router-link>
        <router-link :to="{ name: 'document', params: { id: document.id, routing: document.routing}, query: { tab: 'preview' }}" class="nav-item nav-link" v-bind:class="{active: tab === 'preview'}">
          {{$t('document.preview')}}
        </router-link>
      </div>
    </nav>
    <div class="tab-content">
      <div class="tab-pane" v-bind:class="{active: tab === 'details'}">
        <dl class="row">
          <dt class="col-sm-3">{{ $t('document.name') }}</dt>
          <dd class="col-sm-9">{{ document.basename }}</dd>
          <dt class="col-sm-3">{{ $t('document.path') }}</dt>
          <dd class="col-sm-9">{{ document.source.path }}</dd>
          <dt class="col-sm-3">{{ $t('document.id') }}</dt>
          <dd class="col-sm-9">{{ document.id }}</dd>

          <template v-if="document.source.metadata.tika_metadata_creation_date">
            <dt class="col-sm-3">{{ $t('document.creation_date') }}</dt>
            <dd class="col-sm-9">{{ document.creationDate }}</dd>
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
      <div class="tab-pane text-pre-wrap" v-bind:class="{active: tab === 'text'}" v-html="markedSourceContent"></div>
      <div class="tab-pane" v-bind:class="{active: tab === 'preview'}">
        Not available
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import sortedUniqBy from 'lodash/sortedUniqBy'
import escape from 'lodash/escape'
import {highlight} from '../utils/strings'

export default {
  name: 'document-view',
  props: ['id', 'routing'],
  data () {
    return {tab: 'details'}
  },
  methods: {
    getDoc () {
      return this.$store.dispatch('document/get', {id: this.id, routing: this.routing})
        .then(() => this.$store.dispatch('document/getNamedEntities'))
    }
  },
  computed: {
    ...mapState('document', {
      document: state => state.doc,
      namedEntities: state => sortedUniqBy(state.namedEntities, ne => ne.source.offset)
    }),
    markedSourceContent () {
      if (this.document) {
        return highlight(this.document.source.content, this.namedEntities,
          m => `<mark class="ner ${m.category}">${m.source.mention}</mark>`, r => escape(r), m => m.source.mention)
      }
    }
  },
  beforeRouteEnter (to, _from, next) {
    next(vm => {
      vm.$set(vm, 'tab', to.query.tab || 'details')
      vm.getDoc()
    })
  },
  beforeRouteUpdate (to, _from, next) {
    this.$set(this, 'tab', to.query.tab || 'details')
    if (to.params.id !== _from.params.id || to.params.routing !== _from.params.routing) {
      this.getDoc()
    }
    next()
  }
}
</script>

<style lang="scss">
.text-pre-wrap {
  white-space: pre-wrap;
}
.ner {
  border-bottom: 1px dotted;
  &.organization {
    background-color: rgba(108, 204, 255, 0.63);
  }
  &.person {
    background-color: rgba(149, 255, 129, 0.63);
  }
  &.location {
    background-color: rgb(255, 225, 165);
  }
}
</style>
