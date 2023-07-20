<template>
  <b-modal
    id="document-modal"
    :show="documentInModalIndex !== null"
    size="xl"
    lazy
    hide-header
    hide-footer
    body-class="p-0"
  >
    <div v-if="documentInModal" :key="documentInModalIndex">
      <document-navbar :id="documentInModal.id" :index="documentInModal.index" :routing="documentInModal.routing">
        <template #back>
          <a role="button" class="small text-white" @click="hideModal">
            <fa icon="chevron-circle-left"></fa>
            <span class="ml-2">
              {{ $t('batchSearchResults.backToResults') }}
            </span>
          </a>
        </template>
        <template #nav>
          <quick-item-nav v-model="documentInModalIndex" :total-items="totalItems" @change="handlePrevNextRoute" />
        </template>
      </document-navbar>
      <v-wait for="load batchSearch results">
        <document-view
          :id="documentInModal.id"
          :index="documentInModal.index"
          :q="documentInModal.q"
          :routing="documentInModal.routing"
        />
      </v-wait>
    </div>
  </b-modal>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import DocumentNavbar from '@/components/document/DocumentNavbar.vue'
import DocumentView from '@/pages/DocumentView.vue'
import QuickItemNav from '@/components/QuickItemNav.vue'
import settings from '@/utils/settings'

export default {
  name: 'DocumentInModal',
  components: {
    DocumentNavbar,
    DocumentView,
    QuickItemNav
  },
  model: {
    prop: 'documentInModalPageIndex',
    event: 'change'
  },
  props: {
    documentInModalPageIndex: {
      type: Number,
      default: null
    },
    page: {
      type: Number,
      default: 1
    }
  },
  computed: {
    ...mapState('batchSearch', ['results', 'totalItems']),
    ...mapGetters('batchSearch', ['totalItems']),
    hasDocumentInModal() {
      const pageIndex = this.documentInModalPageIndex
      return pageIndex !== null && this.results[pageIndex]
    },
    documentInModal() {
      if (!this.hasDocumentInModal) {
        return null
      }
      const document = this.results[this.documentInModalPageIndex]
      const { documentId: id, rootId: routing, query: q, project } = document
      const index = project.name
      return { index, id, routing, q }
    },
    documentInModalIndex: {
      get() {
        return this.pageOffset + this.documentInModalPageIndex
      },
      set(index) {
        if (index >= this.pageOffset + this.perPage) {
          this.$emit('update:page', this.page + 1)
        } else if (index < this.pageOffset) {
          this.$emit('update:page', this.page - 1)
        }
        this.$emit('change', index - this.pageOffset)
      }
    },
    perPage() {
      return settings.batchSearchResults.size
    },
    pageOffset() {
      return (this.page - 1) * this.perPage
    },
    isFirstDocument() {
      return this.documentInModalPageIndex === 0
    },
    isLastDocument() {
      const totalResultsIndices = this.results.length - 1
      return this.documentInModalPageIndex === totalResultsIndices
    }
  },
  methods: {
    handlePrevNextRoute(newIndex) {
      if (this.isFirstDocument || this.isLastDocument) {
        this.$emit('update:doc-index', { docIndex: newIndex })
        // this.$router.push(this.generateLinkToBatchSearchResults(, this.selectedQueries))
      }
    },
    hideModal() {
      this.$bvModal.hide('document-modal')
    }
  }
}
</script>
