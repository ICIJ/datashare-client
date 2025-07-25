import { computed, ref, reactive } from 'vue'
import { set } from 'lodash'
import { defineStore } from 'pinia'

export const useDocumentViewStore = defineStore(
  'documentView',
  () => {
    const rotations = reactive({})
    const embeddedPdf = ref(false)

    function computedDocumentRotation({ index, id }) {
      return computed({
        get() {
          return rotations[index]?.[id] || 0
        },
        set(rotation) {
          set(rotations, [index, id], rotation)
        }
      })
    }

    return { embeddedPdf, computedDocumentRotation }
  },
  { persist: true }
)
