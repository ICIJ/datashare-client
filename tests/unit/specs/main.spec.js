import vm from '@/main'
import Vue from 'vue'

describe('main', () => {
  it('should instanciate Vue', () => {
    expect(vm).toBeInstanceOf(Vue)
  })

  it('should create a view model with a router', () => {
    expect(vm.$router).toBeDefined()
  })

  it('should create a view model with a store', () => {
    expect(vm.$store).toBeDefined()
  })
})
