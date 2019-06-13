import fetchPonyfill from 'fetch-ponyfill'
const { Response } = fetchPonyfill()

function jsonOk (body = {}, status = 200) {
  const mockResponse = new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-type': 'application/json'
    }
  })
  return Promise.resolve(mockResponse)
}

export { jsonOk }
