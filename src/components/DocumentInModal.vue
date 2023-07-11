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
          <a role="button" class="small text-white" @click="$bvModal.hide('document-modal')">
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
import DocumentNavbar from '@/components/document/DocumentNavbar.vue'
import DocumentView from '@/pages/DocumentView.vue'
import QuickItemNav from '@/components/QuickItemNav.vue'

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
    results: {
      type: Array,
      default: () => []
    },
    totalItems: {
      type: Number,
      default: 1
    }
  },
  data: function () {
    return {
      documentInModalNavIndex: this.documentInModalPageIndex
    }
  },
  computed: {
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
          this.page++
        } else if (index < this.pageOffset) {
          this.page--
        }
        this.$emit('change', index - this.pageOffset)
        // this.documentInModalPageIndex = index - this.pageOffset
      }
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
        this.$emit('update-route', { currentPage: this.currentPage, selectedQueries: this.selectedQueries })
        // this.$router.push(this.generateLinkToBatchSearchResults(, this.selectedQueries))
      }
    }
  }
}
</script>
