import Vue from 'vue'
import { createLocalVue } from '@vue/test-utils'
import { createApp } from '@/main'
import fetchPonyfill from 'fetch-ponyfill'
import { jsonResp } from 'tests/unit/tests_utils'

const { fetch } = fetchPonyfill()
window.fetch = fetch

describe('main', () => {
  beforeEach(() => {
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    window.fetch = jest.fn()
    window.fetch.mockReturnValue(jsonResp({ userProjects: ['first-index'] }))
  })

  afterEach(() => window.fetch.mockRestore())

  it('should instantiate Vue', async () => {
    const { vm } = await createApp(createLocalVue())
    expect(vm).toBeInstanceOf(Vue)
    expect(vm.$router).toBeDefined()
    expect(vm.$store).toBeDefined()
  })

  it('should set the config', async () => {
    window.fetch.mockReturnValue(jsonResp({ userProjects: ['first-index'], key: 'value' }))
    const { vm } = await createApp(createLocalVue())
    expect(vm.$config).toBeDefined()
    expect(vm.$config.get('userProjects')).toEqual(['first-index'])
    expect(vm.$config.get('key')).toEqual('value')
  })
})
