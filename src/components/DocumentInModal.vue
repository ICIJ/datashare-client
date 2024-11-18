<template>
  <b-modal id="document-modal" v-model="showModal" size="xl" lazy hide-header hide-footer body-class="p-0">
    <div v-if="documentInModal" :key="documentInModalIndex">
      <document-view
        :id="documentInModal.id"
        :index="documentInModal.index"
        :q="documentInModal.q"
        :routing="documentInModal.routing"
      />
    </div>
  </b-modal>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import DocumentView from '@/views/Document/DocumentView/DocumentView'
import settings from '@/utils/settings'

export default {
  name: 'DocumentInModal',
  components: {
    DocumentView
  },
  props: {
    pageIndex: {
      type: Number,
      default: null
    },
    page: {
      type: Number,
      default: 1
    },
    show: {
      type: Boolean
    }
  },
  emits: ['update:pageIndex', 'update:page', 'update:show'],
  data() {
    return {
      showModal: this.show
    }
  },
  computed: {
    ...mapState('batchSearch', ['results']),
    ...mapGetters('batchSearch', ['totalItems']),
    hasDocumentInModal() {
      const pageIndex = this.pageIndex
      return pageIndex !== null && this.results[pageIndex]
    },
    documentInModal() {
      if (!this.hasDocumentInModal) {
        return null
      }
      const document = this.results[this.pageIndex]
      const { documentId: id, rootId: routing, query: q, project } = document
      const index = project.name
      return { index, id, routing, q }
    },
    documentInModalIndex: {
      get() {
        return this.pageOffset + this.pageIndex
      },
      set(index) {
        const docIndex = index % this.perPage
        if (index >= this.pageOffset + this.perPage) {
          this.$emit('update:page', { page: this.page + 1, docIndex })
        } else if (index < this.pageOffset) {
          this.$emit('update:page', { page: this.page - 1, docIndex })
        } else {
          this.$emit('update:pageIndex', Math.max(index - this.pageOffset, 0))
        }
      }
    },
    perPage() {
      return settings.batchSearchResults.size
    },
    pageOffset() {
      return (this.page - 1) * this.perPage
    },
    isFirstDocument() {
      return this.pageIndex === 0
    },
    isLastDocument() {
      const totalResultsIndices = this.results.length - 1
      return this.pageIndex === totalResultsIndices
    }
  },
  watch: {
    show(value) {
      this.showModal = value
    },
    pageIndex(value) {
      this.showModal = this.show && !!value
      this.$emit('update:show', this.showModal)
    },
    showModal(value) {
      if (value !== this.show) {
        this.$emit('update:show', value)
      }
    }
  },
  methods: {
    hideModal() {
      this.showModal = false
      this.$emit('update:show', false)
    }
  }
}
</script>
