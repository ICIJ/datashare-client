import store from '@/store'
import { SimplePipeline, IdentityPipeline, AddLineBreaksPipeline } from '@/store/pipelines'

describe('PipelinesStore', () => {
  it('should define a store module', () => {
    expect(store.state.pipelines).not.toBeUndefined()
  })

  it('should found a pipeline by its name', () => {
    const name = 'test-finding-by-name'
    store.commit('pipelines/register', { name })
    const pipeline = store.getters['pipelines/getPipelineByName'](name)
    expect(pipeline).toBeInstanceOf(Object)
    expect(pipeline.name).toBe(name)
  })

  it('should found an instantiated pipeline by its name', () => {
    const name = 'test-finding-instantiated-by-name'
    store.commit('pipelines/register', { name })
    const pipeline = store.getters['pipelines/getInstantiatedPipelineByName'](name)
    expect(pipeline).toBeInstanceOf(IdentityPipeline)
    expect(pipeline.name).toBe(name)
  })

  it('should register a pipeline with a function', () => {
    const name = 'test-pl-with-function'
    const type = value => value.toUpperCase()
    store.commit('pipelines/register', { name, type })
    const pipeline = store.getters['pipelines/getInstantiatedPipelineByName'](name)
    expect(pipeline).toBeInstanceOf(SimplePipeline)
    expect(pipeline.apply('foo')).toBe('FOO')
  })

  it('should register a pipeline with a function', () => {
    class Type {
      apply (value) {
        return value.toUpperCase()
      }
    }
    const name = 'test-pl-with-constructor'
    store.commit('pipelines/register', { name, type: Type })
    const pipeline = store.getters['pipelines/getInstantiatedPipelineByName'](name)
    expect(pipeline).toBeInstanceOf(Type)
    expect(pipeline.apply('bar')).toBe('BAR')
  })

  it('should register a pipeline with a name', () => {
    const type = 'AddLineBreaksPipeline'
    const name = 'test-pl-with-name'
    store.commit('pipelines/register', { name, type })
    const pipeline = store.getters['pipelines/getInstantiatedPipelineByName'](name)
    expect(pipeline).toBeInstanceOf(AddLineBreaksPipeline)
    expect(pipeline.apply('foo\nbar')).toBe('<p>foo</p><p>bar</p>')
    expect(pipeline.apply('bar\nfoo')).toBe('<p>bar</p><p>foo</p>')
  })

  it('should register 2 pipelines with the category `test-category-foo`', () => {
    const category = 'test-category-foo'
    store.commit('pipelines/register', { category })
    store.commit('pipelines/register', { category })
    const pipelines = store.getters['pipelines/getInstantiatedPipelineByCategory'](category)
    expect(pipelines).toHaveLength(2)
  })

  it('should register 3 pipelines with the category `test-category-bar`', () => {
    const category = 'test-category-bar'
    store.commit('pipelines/register', { category })
    store.commit('pipelines/register', { category })
    store.commit('pipelines/register', { category })
    const pipelines = store.getters['pipelines/getInstantiatedPipelineByCategory'](category)
    expect(pipelines).toHaveLength(3)
  })

  it('should register a pipeline using the type `IdentityPipeline` by default', () => {
    const name = 'pipeline-with-no-type'
    store.commit('pipelines/register', { name })
    const pipeline = store.getters['pipelines/getInstantiatedPipelineByName'](name)
    expect(pipeline).toBeInstanceOf(IdentityPipeline)
  })

  it('should register a pipeline with no name', () => {
    const category = 'test-category-with-no-name'
    store.commit('pipelines/register', { category })
    const pipelines = store.getters['pipelines/getInstantiatedPipelineByCategory'](category)
    expect(pipelines).toHaveLength(1)
    expect(pipelines[0]).toHaveProperty('name')
    expect(pipelines[0].name.indexOf('pipeline-')).toBe(0)
  })

  it('should return a list of functions', () => {
    const category = 'test-category-chain'
    store.commit('pipelines/register', { category })
    store.commit('pipelines/register', { category })
    store.commit('pipelines/register', { category })
    const pipelines = store.getters['pipelines/getPipelineChainByCategory'](category)
    expect(pipelines).toHaveLength(3)
    expect(pipelines.reduce((res, fn) => fn(res), 'foo')).toBe('foo')
    expect(pipelines.reduce((res, fn) => fn(res), 'bar')).toBe('bar')
  })

  it('should apply a pipeline chain which multiply by 2', () => {
    const category = 'test-category-math'
    const type = (value) => value * 2
    store.commit('pipelines/register', { category, type })
    store.commit('pipelines/register', { category, type })
    const pipelines = store.getters['pipelines/getPipelineChainByCategory'](category)
    expect(pipelines).toHaveLength(2)
    expect(pipelines.reduce((res, fn) => fn(res), 1)).toBe(4)
    expect(pipelines.reduce((res, fn) => fn(res), 10)).toBe(40)
  })
})
