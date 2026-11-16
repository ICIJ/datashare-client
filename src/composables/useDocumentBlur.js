import { shallowRef, toValue, watch } from 'vue'

import { useDocumentPreview } from '@/composables/useDocumentPreview'

/**
 * Whether a document's path banners ask to blur it, and the note to show over it.
 * Checked again whenever the document changes; the reader's choice to show it stands until then.
 *
 * @param {import('vue').MaybeRefOrGetter<object>} document - The document to check.
 * @param {object} [options]
 * @param {boolean|null} [options.initial=null] - The value until the banners are fetched.
 * @returns {{ blurred: import('vue').ShallowRef<boolean|null>, blurredContent: import('vue').ShallowRef<string|null>, error: import('vue').ShallowRef<Error|null> }}
 */
export function useDocumentBlur(document, { initial = null } = {}) {
  const { isBlurred, getBlurredContentBanner } = useDocumentPreview()
  const blurred = shallowRef(initial)
  const blurredContent = shallowRef(null)
  const error = shallowRef(null)

  async function check(value) {
    blurred.value = initial
    error.value = null
    try {
      const isValueBlurred = await isBlurred(value)
      const banner = isValueBlurred ? await getBlurredContentBanner(value) : null
      // A document swapped in while this one resolved owns the banner now.
      if (value !== toValue(document)) {
        return
      }
      blurred.value = isValueBlurred
      blurredContent.value = banner
    }
    catch (failure) {
      if (value === toValue(document)) {
        error.value = failure
      }
    }
  }

  watch(() => toValue(document), check, { immediate: true })

  return { blurred, blurredContent, error }
}
