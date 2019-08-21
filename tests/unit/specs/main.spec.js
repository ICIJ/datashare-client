import Vue from 'vue'
import { createLocalVue } from '@vue/test-utils'
import { createApp } from '@/main'
import fetchPonyfill from 'fetch-ponyfill'
import { jsonOk } from 'tests/unit/tests_utils'

jest.mock('v-calendar/lib/v-calendar.min.css', () => {})

const { fetch } = fetchPonyfill()
window.fetch = fetch

describe('main', () => {
  beforeEach(() => {
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    window.fetch = jest.fn()
    window.fetch.mockReturnValue(jsonOk({ userIndices: ['first-index'] }))
  })

  afterEach(() => window.fetch.mockRestore())

  it('should instantiate Vue', async () => {
    const vm = await createApp(createLocalVue())
    expect(vm).toBeInstanceOf(Vue)
    expect(vm.$router).toBeDefined()
    expect(vm.$store).toBeDefined()
  })

  it('should set the config', async () => {
    window.fetch.mockReturnValue(jsonOk({ userIndices: ['first-index'], key: 'value' }))
    const vm = await createApp(createLocalVue())
    expect(vm.$config).toBeDefined()
    expect(vm.$config.get('userIndices')).toEqual(['first-index'])
    expect(vm.$config.get('key')).toEqual('value')
  })

  it('should set the ES index for the futures searches', async () => {
    window.fetch.mockReturnValue(jsonOk({ userIndices: ['first-index'] }))
    const vm = await createApp(createLocalVue())
    expect(vm.$store.state.search.index).toEqual('first-index')
  })
})
