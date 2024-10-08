import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import WidgetTreeMap from '@/components/Widget/WidgetTreeMap'

vi.mock('@/api/elasticsearch', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    search: () => {
      return {
        aggregations: {
          byDirname: {
            buckets: [{ key: '/home/dev/data/folders', doc_count: 50 }]
          }
        }
      }
    }
  }
})

describe('WidgetTreeMap.vue', () => {
  let wrapper = null
  let core, store, api, plugins

  beforeAll(() => {
    api = {
      elasticsearch: {
        search: vi.fn().mockResolvedValue({
          aggregations: { byDirname: { buckets: [{ key: '/home/dev/data/folders', doc_count: 50 }] } }
        })
      }
    }
    core = CoreSetup.init(api).useAll()
    store = core.store
    plugins = core.plugins
    document.body.innerHTML = '<div id="widget_tree_map"><svg></svg></div>'
  })

  beforeEach(() => {
    store.commit('insights/reset')
    wrapper = shallowMount(WidgetTreeMap, {
      global: { plugins },
      props: { widget: {} },
      data() {
        return { id: 'widget_tree_map' }
      }
    })
  })

  it('should be a Vue instance', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should have a "widget--tree-map" class', () => {
    expect(wrapper.attributes('class')).toContain('widget--tree-map')
  })

  it('should contain a "hello world" title', () => {
    const props = { widget: { title: 'Hello world' } }
    wrapper = shallowMount(WidgetTreeMap, {
      global: { plugins },
      props,
      data() {
        return { id: 'widget_tree_map' }
      }
    })
    expect(wrapper.find('.widget__header').text()).toBe('Hello world')
  })

  it('should display children names in the tree map without transformation', async () => {
    expect(document.getElementsByTagName('text')[0].innerHTML).toBe('folders')
  })

  it('should display children names in the tree map with transformation', async () => {
    expect(document.getElementsByTagName('text')[0].innerHTML).toBe('folders')
  })

  it('should display a link to a datashare search on the current path', async () => {
    expect(wrapper.find('.widget__content__search').exists()).toBe(true)
  })
})
