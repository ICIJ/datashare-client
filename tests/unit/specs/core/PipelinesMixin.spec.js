import { Core } from '@/core'
import { usePipelinesStore, useSearchStore } from '@/store/modules'

describe('PipelinesMixin', () => {
  let core, pipelinesStore, searchStore

  beforeEach(async () => {
    core = Core.init().useAll()
    searchStore = useSearchStore()
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
    searchStore.setIndex('first-index')
    expect(pipelinesStore.getPipelinesByCategory('biz')).toHaveLength(1)
  })

  it('should find no pipeline on the current project', () => {
    core.registerPipelineForProject('first-index', { category: 'flu' })
    searchStore.setIndex('first-index')
    expect(pipelinesStore.getPipelinesByCategory('flu')).toHaveLength(1)
    searchStore.setIndex('second-index')
    expect(pipelinesStore.getPipelinesByCategory('flu')).toHaveLength(0)
  })
})
