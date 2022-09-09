import { createLocalVue, shallowMount } from '@vue/test-utils'

import { flushPromises } from 'tests/unit/tests_utils'
import JsonViewer from '@/components/document/viewers/JsonViewer'
import JsonFormatter from '@/components/JsonFormatter'
import { Core } from '@/core'
import { Api } from '@/api'
const documentJson = require('tests/unit/resources/document.json')

describe('JsonViewer.vue', () => {
  let localVue, mockAxios, api, wrapper
  beforeAll(() => {
    mockAxios = { request: jest.fn() }
    api = new Api(mockAxios, null)
    const core = Core.init(createLocalVue(), api).useAll()
    localVue = core.localVue
  })

  beforeEach(async () => {
    mockAxios.request.mockResolvedValue({ data: documentJson })
    wrapper = shallowMount(JsonViewer, { localVue, propsData: { document: { url: 'document.json' } } })
    await flushPromises()
  })
  afterEach(() => mockAxios.request.mockClear())

  it('should render the JSON in a JsonFormatter component', () => {
    expect(wrapper.findComponent(JsonFormatter).exists()).toBeTruthy()
  })
})
