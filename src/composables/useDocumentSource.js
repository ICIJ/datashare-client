import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/useCore'

/**
 * Fetch a document's raw source through the API, mapping fetch failures to
 * localized, user-facing error messages. This is the Composition API
 * counterpart of `datashareSourceMixin` for `<script setup>` viewers.
 */
export function useDocumentSource() {
  const core = useCore()
  const { t } = useI18n()

  /**
   * @param {object} document - The document to fetch.
   * @param {object} [config] - Extra axios config (e.g. `{ responseType: 'text' }`).
   * @returns {Promise<*>} The document source.
   * @throws {Error} A localized error when the source cannot be fetched.
   */
  async function fetchSource(document, config = {}) {
    try {
      return await core.api.getSource(document, config)
    }
    catch (error) {
      if (error?.response?.status === 404) {
        throw new Error(t('document.errorNotFound'))
      }
      throw new Error(t('document.notAvailable'))
    }
  }

  return { fetchSource }
}
