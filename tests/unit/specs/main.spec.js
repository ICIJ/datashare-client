import Vue from 'vue'
import { vm, createApp } from '@/main'
import fetchPonyfill from 'fetch-ponyfill'

const { fetch, Response } = fetchPonyfill()
window.fetch = fetch

describe('main', () => {
  beforeEach(() => {
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    window.fetch = jest.fn()
    window.fetch.mockReturnValue(jsonOk({}))
  })

  afterEach(() => window.fetch.mockRestore())

  it('should instantiate Vue', async () => {
    await createApp()
    expect(vm).toBeInstanceOf(Vue)
    expect(vm.$router).toBeDefined()
    expect(vm.$store).toBeDefined()
  })

  it('should set the config', async () => {
    window.fetch.mockReturnValue(jsonOk({ key: 'value' }))
    await createApp()
    expect(vm.config).toBeDefined()
    expect(vm.config).toEqual({ key: 'value' })
  })
})

function jsonOk (body) {
  const mockResponse = new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-type': 'application/json'
    }
  })
  return Promise.resolve(mockResponse)
}
