import { createLocalVue } from '@vue/test-utils'
import { Core } from '@/core'

describe('PipelinesMixin', () => {
  let core

  beforeEach(async () => {
    core = Core.init(createLocalVue()).useAll()
  })

  it('should find several pipeline by their category', () => {
    core.registerPipeline({ category: 'foo' })
    core.registerPipeline({ category: 'baz' })
    core.registerPipeline({ category: 'baz' })
    expect(core.store.getters['pipelines/getPipelinesByCategory']('baz')).toHaveLength(2)
  })

  it('should find one pipeline by its category on the current project', () => {
    core.registerPipelineForProject('first-index', { category: 'biz' })
    expect(core.store.getters['pipelines/getPipelinesByCategory']('biz')).toHaveLength(0)
    core.store.commit('search/index', 'first-index')
    expect(core.store.getters['pipelines/getPipelinesByCategory']('biz')).toHaveLength(1)
  })

  it('should find no pipeline on the current project', () => {
    core.registerPipelineForProject('first-index', { category: 'flu' })
    core.store.commit('search/index', 'first-index')
    expect(core.store.getters['pipelines/getPipelinesByCategory']('flu')).toHaveLength(1)
    core.store.commit('search/index', 'second-index')
    expect(core.store.getters['pipelines/getPipelinesByCategory']('flu')).toHaveLength(0)
  })
})
