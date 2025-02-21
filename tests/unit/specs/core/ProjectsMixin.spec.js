import toLower from 'lodash/toLower'

import { Core } from '@/core'
import { useSearchStore } from '@/store/modules'

describe('ProjectsMixin', () => {
  const project = toLower('ProjectsMixin')
  const anotherProject = toLower('AnotherProjectsMixin')
  let core, searchStore

  beforeEach(() => {
    core = Core.init().useAll()
    searchStore = useSearchStore()
    searchStore.setIndex(anotherProject)
  })

  it('should call a function when a project is selected', async () => {
    const withFn = vi.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withFn })
    // Switch to the project
    searchStore.setIndex(project)
    // And check the function has been called
    expect(withFn).toBeCalled()
  })

  it('should call a function when a project is selected with another', async () => {
    const withFn = vi.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withFn })
    // Switch to the project
    searchStore.setIndices([project, anotherProject])
    // And check the function has been called
    expect(withFn).toBeCalled()
  })

  it('should call a function twice when a project is selected', async () => {
    const withFn = vi.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withFn })
    // Switch between projects
    searchStore.setIndex(project)
    searchStore.setIndex(anotherProject)
    searchStore.setIndex(project)
    // And check the function has been called
    expect(withFn).toBeCalledTimes(2)
  })

  it('should call a function twice when a project is selected with another', async () => {
    const withFn = vi.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withFn })
    // Switch between projects
    searchStore.setIndices([project, anotherProject])
    searchStore.setIndices([anotherProject])
    searchStore.setIndices([project, anotherProject])
    // And check the function has been called
    expect(withFn).toBeCalledTimes(2)
  })

  it('should call a function when a project is unselected', async () => {
    const withoutFn = vi.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withoutFn })
    // Switch to the project
    searchStore.setIndices([anotherProject])
    // And check the function has been called
    expect(withoutFn).toBeCalled()
  })

  it('should call a function twice when a project is unselected', async () => {
    const withoutFn = vi.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withoutFn })
    // Switch between projects
    searchStore.setIndices([anotherProject])
    searchStore.setIndices([project])
    searchStore.setIndices([anotherProject])
    // And check the function has been called
    expect(withoutFn).toBeCalledTimes(3)
  })

  it('should call the function when a project is selected, then call the other when unselected', async () => {
    const withFn = vi.fn()
    const withoutFn = vi.fn()
    // Bind the function to the project
    core.toggleForProject({ project, withFn, withoutFn })
    // Switch between projects
    searchStore.setIndices([project])
    expect(withFn).toBeCalledTimes(1)
    expect(withoutFn).toBeCalledTimes(1)
    searchStore.setIndices([anotherProject])
    expect(withFn).toBeCalledTimes(1)
    expect(withoutFn).toBeCalledTimes(2)
    searchStore.setIndices([project])
    expect(withFn).toBeCalledTimes(2)
    expect(withoutFn).toBeCalledTimes(2)
  })

  it('should create the default project', async () => {
    const api = { createProject: vi.fn() }
    core = Core.init(api).useAll()
    const name = 'default-project'
    core.config.set('defaultProject', name)
    await core.createDefaultProject()
    expect(api.createProject).toBeCalledWith({
      allowFromMask: '*.*.*.*',
      description: 'Your main project on Datashare',
      label: 'Default',
      name: 'default-project',
      sourcePath: undefined
    })
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
