import { vm, createApp } from '@/main'
import Vue from 'vue'
import fetchPonyfill from 'fetch-ponyfill'

const { fetch, Response } = fetchPonyfill()
window.fetch = fetch

describe('main', () => {
  beforeEach(() => {
    var app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    window.fetch = jest.fn()
    window.fetch.mockReturnValue(jsonOk({}))
  })

  afterEach(() => {
    window.fetch.mockRestore()
  })

  it('should instanciate Vue', async () => {
    await createApp()
    expect(vm).toBeInstanceOf(Vue)
  })

  it('should create a view model with a router', async () => {
    await createApp()
    expect(vm.$router).toBeDefined()
  })

  it('should create a view model with a store', async () => {
    await createApp()
    expect(vm.$store).toBeDefined()
  })

  it('should set the config', async () => {
    window.fetch.mockReturnValue(jsonOk({ key: 'value' }))
    await createApp()
    expect(Vue.prototype.config).toBeDefined()
    expect(Vue.prototype.config).toEqual({ key: 'value' })
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
