import toLower from 'lodash/toLower'
import { createLocalVue } from '@vue/test-utils'

import { Api } from '@/api'
import { Core } from '@/core'

describe('ProjectsMixin', () => {
  const project = toLower('ProjectsMixin')
  const anotherProject = toLower('AnotherProjectsMixin')
  let core, api, mockAxios

  beforeAll(() => {
    mockAxios = { request: jest.fn() }
    api = new Api(mockAxios)
  })
  beforeEach(() => {
    mockAxios.request.mockClear()
    core = Core.init(createLocalVue(), api).useAll()
    core.store.commit('search/indices', [anotherProject])
  })

  it('should call a function when a project is selected', async () => {
    const withFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withFn })
    // Switch to the project
    core.store.commit('search/indices', [project])
    // And check the function has been called
    expect(withFn).toBeCalled()
  })

  it('should call a function when a project is selected with another', async () => {
    const withFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withFn })
    // Switch to the project
    core.store.commit('search/indices', [project, anotherProject])
    // And check the function has been called
    expect(withFn).toBeCalled()
  })

  it('should call a function twice when a project is selected', async () => {
    const withFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withFn })
    // Switch between projects
    core.store.commit('search/indices', [project])
    core.store.commit('search/indices', [anotherProject])
    core.store.commit('search/indices', [project])
    // And check the function has been called
    expect(withFn).toBeCalledTimes(2)
  })

  it('should call a function twice when a project is selected with another', async () => {
    const withFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withFn })
    // Switch between projects
    core.store.commit('search/indices', [project, anotherProject])
    core.store.commit('search/indices', [anotherProject])
    core.store.commit('search/indices', [project, anotherProject])
    // And check the function has been called
    expect(withFn).toBeCalledTimes(2)
  })

  it('should call a function when a project is unselected', async () => {
    const withoutFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withoutFn })
    // Switch to the project
    core.store.commit('search/indices', [anotherProject])
    // And check the function has been called
    expect(withoutFn).toBeCalled()
  })

  it('should call a function twice when a project is unselected', async () => {
    const withoutFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withoutFn })
    // Switch between projects
    core.store.commit('search/indices', [anotherProject])
    core.store.commit('search/indices', [project])
    core.store.commit('search/indices', [anotherProject])
    // And check the function has been called
    expect(withoutFn).toBeCalledTimes(3)
  })

  it('should call the function when a project is selected, then call the other when unselected', async () => {
    const withFn = jest.fn()
    const withoutFn = jest.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withFn, withoutFn })
    // Switch between projects
    core.store.commit('search/indices', [project])
    expect(withFn).toBeCalledTimes(1)
    expect(withoutFn).toBeCalledTimes(1)
    core.store.commit('search/indices', [anotherProject])
    expect(withFn).toBeCalledTimes(1)
    expect(withoutFn).toBeCalledTimes(2)
    core.store.commit('search/indices', [project])
    expect(withFn).toBeCalledTimes(2)
    expect(withoutFn).toBeCalledTimes(2)
  })

  it('should create the default project', async () => {
    const name = 'default-project'
    core.config.set('defaultProject', name)
    await core.createDefaultProject()

    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl(`/api/project/`),
        data: expect.objectContaining({ name })
      })
    )
  })

  it('should add a new project to the settings', () => {
    core.config.set('projects', [])
    core.setProject({ name: 'foo' })
    expect(core.projects).toHaveLength(1)
  })

  it('should add three new projects to the settings', () => {
    core.config.set('projects', [])
    core.setProject({ name: 'riri' })
    core.setProject({ name: 'fifi' })
    core.setProject({ name: 'loulou' })
    expect(core.projects).toHaveLength(3)
  })

  it('should update an existing project in the settings', () => {
    core.config.set('projects', [{ name: 'foo', label: 'Foo' }])
    core.setProject({ name: 'foo', label: 'Foo V2' })
    expect(core.projects).toHaveLength(1)
    expect(core.findProject('foo').label).toBe('Foo V2')
  })
})
