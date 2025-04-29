import { setActivePinia, createPinia } from 'pinia'
import { beforeEach } from 'vitest'

import { usePipelinesStore } from '@/store/modules'
import { SimplePipeline, IdentityPipeline, AddLineBreaksPipeline } from '@/store/pipelines'

describe('PipelinesStore', () => {
  let pipelinesStore

  beforeEach(() => {
    setActivePinia(createPinia())
    pipelinesStore = usePipelinesStore()
  })

  it('should found a pipeline by its name', () => {
    const name = 'test-finding-by-name'
    pipelinesStore.register({ name })
    const pipeline = pipelinesStore.getPipelineByName(name)
    expect(pipeline).toBeInstanceOf(Object)
    expect(pipeline.name).toBe(name)
  })

  it('should found an instantiated pipeline by its name', () => {
    const name = 'test-finding-instantiated-by-name'
    pipelinesStore.register({ name })
    const pipeline = pipelinesStore.getInstantiatedPipeline(name)
    expect(pipeline).toBeInstanceOf(IdentityPipeline)
    expect(pipeline.name).toBe(name)
  })

  it('should register a pipeline with a function', () => {
    const name = 'test-pl-with-function'
    const type = (value) => value.toUpperCase()
    pipelinesStore.register({ name, type })
    const pipeline = pipelinesStore.getInstantiatedPipeline(name)
    expect(pipeline).toBeInstanceOf(SimplePipeline)
    expect(pipeline.apply('foo')).toBe('FOO')
  })

  it('should register a pipeline with a function to uppercase', () => {
    class Type {
      apply(value) {
        return value.toUpperCase()
      }
    }
    const name = 'test-pl-with-constructor'
    pipelinesStore.register({ name, type: Type })
    const pipeline = pipelinesStore.getInstantiatedPipeline(name)
    expect(pipeline).toBeInstanceOf(Type)
    expect(pipeline.apply('bar')).toBe('BAR')
  })

  it('should register a pipeline with a name', () => {
    const type = 'AddLineBreaksPipeline'
    const name = 'test-pl-with-name'
    pipelinesStore.register({ name, type })
    const pipeline = pipelinesStore.getInstantiatedPipeline(name)
    expect(pipeline).toBeInstanceOf(AddLineBreaksPipeline)
    expect(pipeline.apply('foo\nbar')).toBe('<p>foo</p><p>bar</p>')
    expect(pipeline.apply('bar\nfoo')).toBe('<p>bar</p><p>foo</p>')
  })

  it('should register 2 pipelines with the category `test-category-foo`', () => {
    const category = 'test-category-foo'
    pipelinesStore.register({ category })
    pipelinesStore.register({ category })
    const pipelines = pipelinesStore.getInstantiatedPipelinesByCategory(category)
    expect(pipelines).toHaveLength(2)
  })

  it('should register 3 pipelines with the category `test-category-bar`', () => {
    const category = 'test-category-bar'
    pipelinesStore.register({ category })
    pipelinesStore.register({ category })
    pipelinesStore.register({ category })
    const pipelines = pipelinesStore.getInstantiatedPipelinesByCategory(category)
    expect(pipelines).toHaveLength(3)
  })

  it('should register a pipeline using the type `IdentityPipeline` by default', () => {
    const name = 'pipeline-with-no-type'
    pipelinesStore.register({ name })
    const pipeline = pipelinesStore.getInstantiatedPipeline(name)
    expect(pipeline).toBeInstanceOf(IdentityPipeline)
  })

  it('should register a pipeline with no name', () => {
    const category = 'test-category-with-no-name'
    pipelinesStore.register({ category })
    const pipelines = pipelinesStore.getInstantiatedPipelinesByCategory(category)
    expect(pipelines).toHaveLength(1)
    expect(pipelines[0]).toHaveProperty('name')
    expect(pipelines[0].name.indexOf('pipeline-')).toBe(0)
  })

  it('should return a list of functions', () => {
    const category = 'test-category-chain'
    pipelinesStore.register({ category })
    pipelinesStore.register({ category })
    pipelinesStore.register({ category })
    const pipelines = pipelinesStore.getPipelineChainByCategory(category)
    expect(pipelines).toHaveLength(3)
    expect(pipelines.reduce((res, fn) => fn(res), 'foo')).toBe('foo')
    expect(pipelines.reduce((res, fn) => fn(res), 'bar')).toBe('bar')
  })

  it('should apply a pipeline chain which multiply by 2', () => {
    const category = 'test-category-math'
    const type = (value) => value * 2
    pipelinesStore.register({ category, type })
    pipelinesStore.register({ category, type })
    const pipelines = pipelinesStore.getPipelineChainByCategory(category)
    expect(pipelines).toHaveLength(2)
    expect(pipelines.reduce((res, fn) => fn(res), 1)).toBe(4)
    expect(pipelines.reduce((res, fn) => fn(res), 10)).toBe(40)
  })

  it('should have ordered pipelines', () => {
    const category = 'test-category-ordered-case'
    pipelinesStore.register({ category, type: (s) => s.toLowerCase() })
    pipelinesStore.register({ category, type: (s) => s.toUpperCase() })
    const pipelines = pipelinesStore.getPipelineChainByCategory(category)
    expect(pipelines).toHaveLength(2)
    expect(pipelines.reduce((res, fn) => fn(res), 'foo BAR')).toBe('FOO BAR')
    expect(pipelines.reduce((res, fn) => fn(res), 'FOO bar')).toBe('FOO BAR')
  })

  it('should have ordered pipelines with a property', () => {
    const category = 'test-category-ordered-case-with-property'
    pipelinesStore.register({ category, type: (s) => s.toLowerCase(), order: 10 })
    pipelinesStore.register({ category, type: (s) => s.toUpperCase(), order: 5 })
    const pipelines = pipelinesStore.getPipelineChainByCategory(category)
    expect(pipelines).toHaveLength(2)
    expect(pipelines.reduce((res, fn) => fn(res), 'foo BAR')).toBe('foo bar')
    expect(pipelines.reduce((res, fn) => fn(res), 'FOO bar')).toBe('foo bar')
  })
})
