import axios from 'axios'

import { EventBus } from '@/utils/eventBus'
import { Api } from '@/api'
import { elasticsearch } from '@/api/elasticsearch'
import settings from '@/utils/settings'

axios.defaults.xsrfCookieName = settings.csrf.cookieName
axios.defaults.xsrfHeaderName = settings.csrf.headerName

const JSON_CONTENT_TYPE = 'application/json; charset=utf-8'

/**
 * Advertise the UTF-8 charset on JSON request bodies (plain objects / arrays).
 * FormData uploads keep their multipart boundary and requests that already set
 * their own Content-Type (e.g. `sendActionAsText`'s `text/plain`) are left as-is.
 */
export function withJsonCharset(config) {
  const { data, headers } = config
  const isJsonBody = data !== null && typeof data === 'object' && !(data instanceof FormData)
  if (isJsonBody && !headers.getContentType()) {
    headers.setContentType(JSON_CONTENT_TYPE)
  }
  return config
}

axios.interceptors.request.use(withJsonCharset)

export const apiInstance = new Api(axios, EventBus, elasticsearch)
