import { createApp } from 'vue'
import { afterEach, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'

import { useNProgress } from '@/composables/useNProgress'

describe('useNProgress', () => {
  let result

  function createContainer() {
    const container = document.createElement('div')
    document.body.appendChild(container)
    return container
  }

  function withSetup() {
    const app = createApp({
      setup() {
        result = useNProgress({ trickle: false })
      }
    })

    app.mount(createContainer())
  }

  beforeEach(() => {
    withSetup()
  })

  afterEach(async () => {
    await flushPromises()
    result.done().remove()
  })

  it('should not create a progress bar by default', () => {
    expect(document.body.querySelector('#nprogress')).toBeNull()
  })

  it('should create a progress bar after `start` is called', () => {
    result.start()
    expect(document.body.querySelector('#nprogress')).not.toBeNull()
  })

  it('should create the progress bar after `start` is callend then remove it with `remove`', async () => {
    result.start()
    expect(document.body.querySelector('#nprogress')).not.toBeNull()
    result.remove()
    expect(document.body.querySelector('#nprogress')).toBeNull()
  })

  it('should be in loading state only after `start` is called', async () => {
    expect(result.isLoading.value).toBe(false)
    result.start()
    expect(result.isLoading.value).toBe(true)
  })

  it('should not be in loading state after `done` is called', async () => {
    result.start()
    result.done()
    expect(result.isLoading.value).toBe(false)
  })

  it('should not be in loading state after `remove` is called', async () => {
    result.start()
    result.remove()
    expect(result.isLoading.value).toBe(false)
  })

  it('should toggle the progress', async () => {
    expect(result.isLoading.value).toBe(false)
    result.toggle()
    expect(result.isLoading.value).toBe(true)
    result.toggle()
    expect(result.isLoading.value).toBe(false)
  })

  it('should toggle the progress explicitely to hide it', async () => {
    result.toggle(false)
    expect(result.isLoading.value).toBe(false)
    result.toggle(false)
    expect(result.isLoading.value).toBe(false)
  })

  it('should toggle the progress explicitely to show it', async () => {
    result.toggle(true)
    expect(result.isLoading.value).toBe(true)
    result.toggle(true)
    expect(result.isLoading.value).toBe(true)
  })
})
