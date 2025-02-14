import { Core } from '@/core'
import { usePipelinesStore } from '@/store/modules/pipelines'

describe('PipelinesMixin', () => {
  let core, pipelinesStore

  beforeEach(async () => {
    core = Core.init().useAll()
    pipelinesStore = usePipelinesStore()
  })

  it('should find several pipeline by their category', () => {
    core.registerPipeline({ category: 'foo' })
    core.registerPipeline({ category: 'baz' })
    core.registerPipeline({ category: 'baz' })
    expect(pipelinesStore.getPipelinesByCategory('baz')).toHaveLength(2)
  })

  it('should find one pipeline by its category on the current project', () => {
    core.registerPipelineForProject('first-index', { category: 'biz' })
    expect(pipelinesStore.getPipelinesByCategory('biz')).toHaveLength(0)
    core.store.commit('search/indices', 'first-index')
    expect(pipelinesStore.getPipelinesByCategory('biz')).toHaveLength(1)
  })

  it('should find no pipeline on the current project', () => {
    core.registerPipelineForProject('first-index', { category: 'flu' })
    core.store.commit('search/indices', 'first-index')
    expect(pipelinesStore.getPipelinesByCategory('flu')).toHaveLength(1)
    core.store.commit('search/indices', 'second-index')
    expect(pipelinesStore.getPipelinesByCategory('flu')).toHaveLength(0)
  })
})
