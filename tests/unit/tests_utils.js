import fs from 'fs'
import { join } from 'path'
import merge from 'lodash/merge'

export function responseWithJson (body = {}, status = 200, headers = {}) {
  const mockResponse = new Response(JSON.stringify(body), {
    status,
    headers: merge(headers, { 'Content-type': 'application/json' })
  })
  return Promise.resolve(mockResponse)
}

export function responseWithArrayBuffer (path) {
  try {
    const arrayBuffer = fs.readFileSync(join(__dirname, `resources/${path}`))
    const status = 200
    const response = { status, arrayBuffer: () => arrayBuffer }
    return Promise.resolve(response)
  } catch (_) {
    const status = 404
    const response = { status, message: 'document.error_not_found' }
    return Promise.reject(response)
  }
}

export const jsonResp = responseWithJson
