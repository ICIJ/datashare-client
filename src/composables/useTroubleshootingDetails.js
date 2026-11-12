import { computed, onMounted, ref, toValue } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { apiInstance as api } from '@/api/apiInstance'
import { parseUserAgent } from '@/utils/userAgent'
import { useAuth } from '@/composables/useAuth'

const hasValue = ([, value]) => value !== null && value !== undefined && value !== ''
const toLine = ([name, value]) => `${name}: ${value}`

/**
 * Collects what a user should send along with an error report: the error
 * itself, where it happened, who saw it and which versions were running.
 * @param {object} error
 * @param {MaybeRefOrGetter<number|null>} error.code - HTTP status code.
 * @param {MaybeRefOrGetter<string|null>} error.message - Error message.
 * @param {MaybeRefOrGetter<string|null>} error.reason - Known error case.
 * @param {MaybeRefOrGetter<object>} error.details - Extra context listed as is.
 * @returns {{ rows: ComputedRef<Array>, text: ComputedRef<string> }}
 */
export function useTroubleshootingDetails({ code, message, reason, details }) {
  const route = useRoute()
  const router = useRouter()
  const { username } = useAuth()

  const occurredAt = new Date().toISOString()
  const clientHash = import.meta.env.VITE_GIT_HASH ?? ''
  const { browser, os } = parseUserAgent(navigator.userAgent)
  const serverVersion = ref(null)

  const fullUrl = computed(() => {
    if (!route) {
      return null
    }
    const { href } = router.resolve(route.fullPath)
    const url = new URL(href, window.location.href)
    return url.href
  })

  const entries = computed(() => ({
    Code: toValue(code),
    Error: toValue(message),
    Reason: toValue(reason),
    URL: fullUrl.value,
    ...toValue(details),
    Date: occurredAt,
    User: username.value,
    Browser: browser,
    OS: os,
    Client: clientHash.substring(0, 7),
    Server: serverVersion.value
  }))

  const rows = computed(() => {
    const allRows = Object.entries(entries.value)
    return allRows.filter(hasValue)
  })

  const text = computed(() => {
    const lines = rows.value.map(toLine)
    return lines.join('\n')
  })

  const fetchServerVersion = async () => {
    try {
      const version = await api.getVersionSilently()
      serverVersion.value = version['git.tag'] || version['git.build.version']
    }
    catch {
      // The backend may be the very thing that failed: the details stay useful without its version.
    }
  }

  onMounted(fetchServerVersion)

  return { rows, text }
}
