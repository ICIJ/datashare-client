import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import WidgetPaths from '@/components/Widget/WidgetPaths'
import { useInsightsStore } from '@/store/modules/insights'
import { LAYOUTS } from '@/enums/pathTree'

describe('WidgetPaths.vue', () => {
  const project = 'local-datashare'
  const sourcePath = 'file:///home/datashare/data'
  const dataDir = '/home/datashare/data'
  const props = { widget: { title: 'Paths' } }

  // PathTree queries Elasticsearch on mount. This suite only cares about the
  // URL round-trip, so the tree is stubbed and its models are driven directly.
  const stubs = {
    PathTree: {
      name: 'PathTree',
      template: '<div />',
      props: ['path', 'layout', 'query', 'openPaths', 'defaultPath', 'projects', 'flush', 'noLabel']
    }
  }

  // useUrlParam batches query-param writes behind a 50ms debounce
  // (useUrlParam.js:38), which flushPromises alone never advances. Waiting it
  // out keeps the real batching in the test instead of mocking lodash/debounce.
  const flushBatchedUpdates = async () => {
    await new Promise(resolve => setTimeout(resolve, 60))
    await flushPromises()
  }

  async function build({ query = {}, projects = [{ name: project, sourcePath }] } = {}) {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    const { plugins, config } = core
    config.merge({ dataDir, projects, pathSeparator: '/' })
    useInsightsStore().setProject(project)
    await core.router.push({ name: 'project.view.overview.paths', params: { name: project }, query })
    const wrapper = mount(WidgetPaths, { global: { plugins, stubs }, props })
    await flushPromises()
    return { wrapper, router: core.router, tree: wrapper.findComponent({ name: 'PathTree' }) }
  }

  it('starts at the project source path with no query param written', async () => {
    const { tree, router } = await build()
    expect(tree.props('path')).toBe(dataDir)
    expect(router.currentRoute.value.query.path).toBeUndefined()
  })

  it('falls back to the configured data dir when the project has no source path', async () => {
    const { tree } = await build({ projects: [{ name: project }] })
    expect(tree.props('path')).toBe(dataDir)
  })

  it('writes the folder to ?path= when the tree navigates', async () => {
    const { tree, router } = await build()
    tree.vm.$emit('update:path', '/home/datashare/data/Clients')
    await flushBatchedUpdates()
    expect(router.currentRoute.value.query.path).toBe('/home/datashare/data/Clients')
  })

  it('restores the folder and the layout from the URL', async () => {
    const query = { path: '/home/datashare/data/Clients', layout: LAYOUTS.GRID }
    const { tree } = await build({ query })
    expect(tree.props('path')).toBe('/home/datashare/data/Clients')
    expect(tree.props('layout')).toBe(LAYOUTS.GRID)
  })

  it('falls back to the grid layout when ?layout= is not a known layout', async () => {
    const { tree } = await build({ query: { layout: 'carousel' } })
    expect(tree.props('layout')).toBe(LAYOUTS.GRID)
  })

  it('writes the layout to ?layout= when the tree switches', async () => {
    const { tree, router } = await build()
    tree.vm.$emit('update:layout', LAYOUTS.LIST)
    await flushBatchedUpdates()
    expect(router.currentRoute.value.query.layout).toBe(LAYOUTS.LIST)
  })

  it('restores the search filter from ?q= and writes it back', async () => {
    const { tree, router } = await build({ query: { q: 'invoice' } })
    expect(tree.props('query')).toBe('invoice')
    tree.vm.$emit('update:query', 'contract')
    await flushBatchedUpdates()
    expect(router.currentRoute.value.query.q).toBe('contract')
  })

  it('roots at a folder outside the data dir rather than failing', async () => {
    const { tree } = await build({ query: { path: '/elsewhere/on/another/machine' } })
    expect(tree.props('path')).toBe('/elsewhere/on/another/machine')
  })

  it('treats a trailing separator as the same folder', async () => {
    const withSlash = await build({ query: { path: '/home/datashare/data/Clients/' } })
    expect(withSlash.tree.props('path')).toBe('/home/datashare/data/Clients')
  })

  it('falls back to the default path when ?path= is empty', async () => {
    const { tree } = await build({ query: { path: '' } })
    expect(tree.props('path')).toBe(dataDir)
  })
  describe('tree layout', () => {
    const layout = LAYOUTS.TREE

    it('keeps the tree rooted at the default path', async () => {
      const query = { layout, path: '/home/datashare/data/Clients/2024' }
      const { tree } = await build({ query })
      expect(tree.props('path')).toBe(dataDir)
    })

    it('expands every ancestor down to the folder in the URL', async () => {
      const query = { layout, path: '/home/datashare/data/Clients/2024' }
      const { tree } = await build({ query })
      expect(tree.props('openPaths')).toEqual([
        '/home/datashare/data/Clients',
        '/home/datashare/data/Clients/2024'
      ])
    })

    it('writes the most recently expanded folder to ?path=', async () => {
      const { tree, router } = await build({ query: { layout } })
      tree.vm.$emit('update:openPaths', ['/home/datashare/data/Clients'])
      await flushBatchedUpdates()
      tree.vm.$emit('update:openPaths', [
        '/home/datashare/data/Clients',
        '/home/datashare/data/Mails'
      ])
      await flushBatchedUpdates()
      expect(router.currentRoute.value.query.path).toBe('/home/datashare/data/Mails')
    })

    it('falls back to the previously opened folder when one is collapsed', async () => {
      const { tree, router } = await build({ query: { layout } })
      tree.vm.$emit('update:openPaths', [
        '/home/datashare/data/Clients',
        '/home/datashare/data/Mails'
      ])
      await flushBatchedUpdates()
      tree.vm.$emit('update:openPaths', ['/home/datashare/data/Clients'])
      await flushBatchedUpdates()
      expect(router.currentRoute.value.query.path).toBe('/home/datashare/data/Clients')
    })

    it('leaves the URL alone when the user navigates back to a shallower folder', async () => {
      const { router } = await build({ query: { layout, path: '/home/datashare/data/Clients/2024' } })
      await router.push({
        name: 'project.view.overview.paths',
        params: { name: project },
        query: { layout, path: '/home/datashare/data/Clients' }
      })
      await flushBatchedUpdates()
      expect(router.currentRoute.value.query.path).toBe('/home/datashare/data/Clients')
    })

    // The widget must reset the folder itself rather than lean on PathTree's own
    // layout watcher (PathTree.vue:541): that reset travels back out through a
    // 50ms debounce, so PathTree would meanwhile load the expanded folder and
    // then load the root again, racing two aggregations against each other.
    it('roots back at the default path as soon as the layout leaves the tree', async () => {
      const { tree } = await build({ query: { layout, path: '/home/datashare/data/Clients' } })
      tree.vm.$emit('update:layout', LAYOUTS.GRID)
      await flushBatchedUpdates()
      expect(tree.props('layout')).toBe(LAYOUTS.GRID)
      expect(tree.props('path')).toBe(dataDir)
    })

    it('returns to the default path when the last open folder is collapsed', async () => {
      const { tree, router } = await build({ query: { layout } })
      tree.vm.$emit('update:openPaths', ['/home/datashare/data/Clients'])
      await flushBatchedUpdates()
      tree.vm.$emit('update:openPaths', [])
      await flushBatchedUpdates()
      expect(router.currentRoute.value.query.path).toBe(dataDir)
    })

    it('expands nothing when the URL folder is outside the default path', async () => {
      const query = { layout, path: '/elsewhere/on/another/machine' }
      const { tree } = await build({ query })
      expect(tree.props('openPaths')).toEqual([])
    })

    it('expands ancestors with a Windows path separator', async () => {
      const core = CoreSetup.init().useAll().useRouterWithoutGuards()
      const { plugins, config } = core
      config.merge({
        pathSeparator: '\\',
        dataDir: 'C:\\Users\\dev\\Data',
        projects: [{ name: project }]
      })
      useInsightsStore().setProject(project)
      await core.router.push({
        name: 'project.view.overview.paths',
        params: { name: project },
        query: { layout, path: 'C:\\Users\\dev\\Data\\Clients\\2024' }
      })
      const wrapper = mount(WidgetPaths, { global: { plugins, stubs }, props })
      await flushPromises()
      const tree = wrapper.findComponent({ name: 'PathTree' })
      expect(tree.props('openPaths')).toEqual([
        'C:\\Users\\dev\\Data\\Clients',
        'C:\\Users\\dev\\Data\\Clients\\2024'
      ])
    })
  })
})
