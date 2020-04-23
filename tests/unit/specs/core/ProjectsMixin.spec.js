import toLower from 'lodash/toLower'
import axios from 'axios'
import { createLocalVue } from '@vue/test-utils'

import Api from '@/api'
import { Core } from '@/core'

jest.mock('axios')

describe('ProjectsMixin', () => {
  const project = toLower('ProjectsMixin')
  const anotherProject = toLower('AnotherProjectsMixin')
  let core

  beforeEach(() => {
    core = Core.init(createLocalVue()).useAll()
    core.store.commit('search/index', anotherProject)
  })

  afterAll(() => jest.unmock('axios'))

  it('should call a function when a project is selected', async () => {
    const withFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withFn })
    // Switch to the project
    core.store.commit('search/index', project)
    // And check the function has been called
    expect(withFn).toBeCalled()
  })

  it('should call a function twice when a project is selected', async () => {
    const withFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withFn })
    // Switch between projects
    core.store.commit('search/index', project)
    core.store.commit('search/index', anotherProject)
    core.store.commit('search/index', project)
    // And check the function has been called
    expect(withFn).toBeCalledTimes(2)
  })
  it('should call a function when a project is unselected', async () => {
    const withoutFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withoutFn })
    // Switch to the project
    core.store.commit('search/index', anotherProject)
    // And check the function has been called
    expect(withoutFn).toBeCalled()
  })

  it('should call a function twice when a project is unselected', async () => {
    const withoutFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withoutFn })
    // Switch between projects
    core.store.commit('search/index', anotherProject)
    core.store.commit('search/index', project)
    core.store.commit('search/index', anotherProject)
    // And check the function has been called
    expect(withoutFn).toBeCalledTimes(3)
  })

  it('should call the function when a project is selected, then call the other when unselected', async () => {
    const withFn = jest.fn()
    const withoutFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withFn, withoutFn })
    // Switch between projects
    core.store.commit('search/index', project)
    expect(withFn).toBeCalledTimes(1)
    expect(withoutFn).toBeCalledTimes(1)
    core.store.commit('search/index', anotherProject)
    expect(withFn).toBeCalledTimes(1)
    expect(withoutFn).toBeCalledTimes(2)
    core.store.commit('search/index', project)
    expect(withFn).toBeCalledTimes(2)
    expect(withoutFn).toBeCalledTimes(2)
  })

  it('should create the default project', () => {
    const defaultProject = 'default-project'
    core.config.set('defaultProject', defaultProject)
    core.createDefaultProject()

    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl(`/api/index/${defaultProject}`)
    }))
  })
})
