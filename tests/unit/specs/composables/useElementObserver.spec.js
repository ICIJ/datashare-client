import { useElementObserver } from '@/composables/useElementObserver'

describe('useElementObserver', () => {
  let container
  let observer

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    observer = useElementObserver(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('resolves immediately if element already exists (created)', async () => {
    const el = document.createElement('div')
    el.className = 'test-element'
    container.appendChild(el)

    const result = await observer.waitForElementCreated('.test-element')
    expect(result).toBe(el)
  })

  it('resolves when element is created later (created)', async () => {
    const promise = observer.waitForElementCreated('.dynamic-element')

    const el = document.createElement('div')
    el.className = 'dynamic-element'
    container.appendChild(el)

    const result = await promise
    expect(result).toBe(el)
  })

  it('rejects if element not created within timeout', async () => {
    await expect(observer.waitForElementCreated('.never-created', 50)).rejects.toThrow(
      'Element \'.never-created\' not created within timeout'
    )
  })

  it('resolves immediately if element already does not exist (destroyed)', async () => {
    await expect(observer.waitForElementDestroyed('.non-existent')).resolves.toBeUndefined()
  })

  it('resolves when element is removed (destroyed)', async () => {
    const el = document.createElement('div')
    el.className = 'to-be-destroyed'
    container.appendChild(el)

    const promise = observer.waitForElementDestroyed('.to-be-destroyed')

    container.removeChild(el)

    await expect(promise).resolves.toBeUndefined()
  })

  it('rejects if element not destroyed within timeout', async () => {
    const el = document.createElement('div')
    el.className = 'never-destroyed'
    container.appendChild(el)

    await expect(observer.waitForElementDestroyed('.never-destroyed', 50)).rejects.toThrow(
      'Element \'.never-destroyed\' not destroyed within timeout'
    )
  })
})
