import { createLocalVue, shallowMount } from '@vue/test-utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocuments, letData } from 'tests/unit/es_utils'

import TreeView from '@/components/TreeView'
import { Core } from '@/core'

const HOME_TREE = {
  name: '/home/foo',
  type: 'directory',
  prot: 'drwxrwxrwx',
  contents: [
    {
      prot: 'drwxr-xr-x',
      contents: [],
      name: '/home/foo/01FOO',
      type: 'directory'
    }
  ]
}

const HOME_TREE_WIN = {
  name: 'C:\\home\\foo',
  type: 'directory',
  prot: 'dw',
  contents: [
    {
      prot: 'dw',
      contents: [],
      name: 'C:\\home\\foo\\01FOO',
      type: 'directory'
    }
  ]
}

describe('TreeView.vue', () => {
  describe('Posix', () => {
    const { index, es } = esConnectionHelper.build()

    const { config, i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
    const propsData = {
      projects: [index],
      path: '/home/foo',
      selectedPaths: ['path_01', 'path_02'],
      size: true,
      count: true,
      infiniteScroll: false
    }

    let wrapper = null

    beforeAll(() => {
      store.commit('search/index', index)
      config.set('dataDir', '/home/foo')
    })

    beforeEach(() => {
      const api = jest.fn()
      wrapper = shallowMount(TreeView, { api, i18n, localVue, propsData, store, wait })
    })

    it('should be a Vue instance', () => {
      expect(wrapper).toBeTruthy()
    })

    it('should display 2 directories', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/bar/doc_01').withIndex(index).count(5))
        .commit()
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/baz/doc_02').withIndex(index).count(5))
        .commit()
      await wrapper.vm.loadData()

      expect(wrapper.find('.tree-view__header__hits').exists()).toBeTruthy()
      expect(wrapper.find('.tree-view__header__hits').text()).toBe('10 docs')
      expect(wrapper.findAll('.tree-view__directories__item:not(.tree-view__directories__item--hits)')).toHaveLength(2)
    })

    it('should display 3 directories including one from the tree', async () => {
      wrapper.vm.$core.api.tree = jest.fn().mockResolvedValue(HOME_TREE)
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/bar/doc_01').withIndex(index).count(5))
        .commit()
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/baz/doc_02').withIndex(index).count(5))
        .commit()
      await wrapper.vm.loadData({ clearPages: true })

      expect(wrapper.find('.tree-view__header__hits').exists()).toBeTruthy()
      expect(wrapper.find('.tree-view__header__hits').text()).toBe('10 docs')
      expect(wrapper.findAll('.tree-view__directories__item:not(.tree-view__directories__item--hits)')).toHaveLength(3)
    })

    it('should be a display a correct basename', async () => {
      wrapper.vm.$core.api.tree = jest.fn().mockResolvedValue(HOME_TREE)
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/bar/doc_01').withIndex(index).count(5))
        .commit()
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/baz/doc_02').withIndex(index).count(5))
        .commit()
      await wrapper.vm.loadData({ clearPages: true })

      expect(wrapper.findAll('.tree-view__directories__item__label').at(0).text()).toBe('bar')
      expect(wrapper.findAll('.tree-view__directories__item__label').at(1).text()).toBe('baz')
      expect(wrapper.findAll('.tree-view__directories__item__label').at(2).text()).toBe('01FOO')
    })

    it('should init selected on component creation', () => {
      expect(wrapper.vm.selected).toEqual(['path_01', 'path_02'])
    })

    it('should display checkboxes if component is selectable', async () => {
      wrapper.setProps({
        selectable: true
      })
      await wrapper.setData({
        pages: [
          {
            hits: {
              total: 10
            },
            aggregations: {
              byDirname: {
                buckets: [
                  { key: 'bar', contentLength: { value: 1024 } },
                  { key: 'baz', contentLength: { value: 1024 } }
                ]
              },
              totalContentLength: {
                value: 2048
              }
            }
          }
        ]
      })
      expect(wrapper.findAll('b-form-checkbox-stub')).toHaveLength(2)
    })

    it('should NOT display checkboxes', async () => {
      wrapper.setProps({
        selectable: false
      })
      await wrapper.setData({
        pages: [
          {
            aggregations: {
              byDirname: {
                buckets: [
                  { key: 'bar', contentLength: { value: 1024 } },
                  { key: 'baz', contentLength: { value: 1024 } }
                ]
              }
            }
          }
        ]
      })
      expect(wrapper.findAll('b-form-checkbox-stub')).toHaveLength(0)
    })
  })
  describe('Windows', () => {
    let wrapper = null

    const { index, es } = esConnectionHelper.build('spec', true)
    const { config, i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()

    const propsData = {
      projects: [index],
      path: 'C:\\home\\foo',
      size: true,
      count: true,
      infiniteScroll: false
    }

    beforeAll(() => {
      store.commit('search/index', index)
      config.set('dataDir', 'C:\\home\\foo')
      config.set('pathSeparator', '\\')
    })

    beforeEach(() => {
      const api = jest.fn()
      wrapper = shallowMount(TreeView, { api, i18n, localVue, propsData, store, wait })
    })

    it('should be a display a correct basename on windows', async () => {
      wrapper.vm.$core.api.tree = jest.fn().mockResolvedValue(HOME_TREE_WIN)
      await letData(es)
        .have(new IndexedDocuments().setBaseName('C:\\home\\foo\\bar\\doc_01').withIndex(index).count(5))
        .commit()
      await letData(es)
        .have(new IndexedDocuments().setBaseName('C:\\home\\foo\\baz\\doc_02').withIndex(index).count(5))
        .commit()
      await wrapper.vm.loadData({ clearPages: true })

      expect(wrapper.findAll('.tree-view__directories__item__label').at(0).text()).toBe('bar')
      expect(wrapper.findAll('.tree-view__directories__item__label').at(1).text()).toBe('baz')
      expect(wrapper.findAll('.tree-view__directories__item__label').at(2).text()).toBe('01FOO')
    })

    it('should display 3 directories including one from the tree on windows', async () => {
      wrapper.vm.$core.api.tree = jest.fn().mockResolvedValue(HOME_TREE_WIN)
      await letData(es)
        .have(new IndexedDocuments().setBaseName('C:\\home\\foo\\bar\\doc_01').withIndex(index).count(5))
        .commit()
      await letData(es)
        .have(new IndexedDocuments().setBaseName('C:\\home\\foo\\baz\\doc_02').withIndex(index).count(5))
        .commit()
      await wrapper.vm.loadData({ clearPages: true })

      expect(wrapper.find('.tree-view__header__hits').exists()).toBeTruthy()
      expect(wrapper.find('.tree-view__header__hits').text()).toBe('10 docs')
      expect(wrapper.findAll('.tree-view__directories__item:not(.tree-view__directories__item--hits)')).toHaveLength(3)
    })
  })
})
