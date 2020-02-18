import { createLocalVue } from '@vue/test-utils'

import { Core } from '@/core'

describe('ProjectsMixin', () => {
  let core

  beforeEach(async () => {
    core = Core.init(createLocalVue()).useAll()
    core.store.commit('search/index', 'my-untested-project')
  })

  it('should call a function when a project is selected', async () => {
    const withFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project: 'my-project', withFn })
    // Switch to the project
    core.store.commit('search/index', 'my-project')
    // And check the function has been called
    expect(withFn).toBeCalled()
  })

  it('should call a function twice when a project is selected', async () => {
    const withFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project: 'my-project', withFn })
    // Switch between projects
    core.store.commit('search/index', 'my-project')
    core.store.commit('search/index', 'my-other-project')
    core.store.commit('search/index', 'my-project')
    // And check the function has been called
    expect(withFn).toBeCalledTimes(2)
  })
  it('should call a function when a project is unselected', async () => {
    const withoutFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project: 'my-project', withoutFn })
    // Switch to the project
    core.store.commit('search/index', 'my-other-project')
    // And check the function has been called
    expect(withoutFn).toBeCalled()
  })

  it('should call a function twice when a project is unselected', async () => {
    const withoutFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project: 'my-project', withoutFn })
    // Switch between projects
    core.store.commit('search/index', 'my-other-project')
    core.store.commit('search/index', 'my-project')
    core.store.commit('search/index', 'my-other-project')
    // And check the function has been called
    expect(withoutFn).toBeCalledTimes(2)
  })

  it('should call the function when a project is selected, then call the other when unselected', async () => {
    const withFn = jest.fn()
    const withoutFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project: 'my-new-project', withFn, withoutFn })
    // Switch between projects
    core.store.commit('search/index', 'my-new-project')
    expect(withFn).toBeCalledTimes(1)
    expect(withoutFn).toBeCalledTimes(0)
    core.store.commit('search/index', 'my-other-project')
    expect(withFn).toBeCalledTimes(1)
    expect(withoutFn).toBeCalledTimes(1)
    core.store.commit('search/index', 'my-new-project')
    expect(withFn).toBeCalledTimes(2)
    expect(withoutFn).toBeCalledTimes(1)
  })
})
