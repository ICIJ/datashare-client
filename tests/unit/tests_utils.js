import merge from 'lodash/merge'
import fetchPonyfill from 'fetch-ponyfill'
const { Response } = fetchPonyfill()

function jsonResp (body = {}, status = 200, headers = {}) {
  const mockResponse = new Response(JSON.stringify(body), {
    status,
    headers: merge(headers, { 'Content-type': 'application/json' })
  })
  return Promise.resolve(mockResponse)
}

export { jsonResp }
