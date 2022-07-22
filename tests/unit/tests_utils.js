import { merge } from 'lodash'
import fs from 'fs'
import { join } from 'path'

export function flushPromises () {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export function responseWithJson (body = {}, status = 200, headers = {}) {
  const mockResponse = new Response(JSON.stringify(body), {
    status,
    headers: merge(headers, { 'Content-type': 'application/json' })
  })
  return Promise.resolve(mockResponse)
}

export function responseWithArrayBuffer (path, returnBuffer = true) {
  try {
    const arrayBuffer = fs.readFileSync(join(__dirname, `resources/${path}`))
    const status = 200
    const mockResponse = returnBuffer ? { status, arrayBuffer: () => arrayBuffer } : arrayBuffer
    return Promise.resolve(mockResponse)
  } catch (_) {
    const status = 404
    const mockResponse = { status, message: 'document.error_not_found' }
    return Promise.reject(mockResponse)
  }
}

export const jsonResp = responseWithJson
