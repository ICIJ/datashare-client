import Api from '@/api'
import { flushPromises } from 'tests/unit/tests_utils'
import BatchDownloadActions from '@/components/BatchDownloadActions'
import { Core } from '@/core'
import { createLocalVue, mount } from '@vue/test-utils'

describe('BatchDownloadActions.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  const projects = [{ name: 'project' }]

  function mockRunBatchDownload (name = 'BatchDownloadTask', batchDownload = {}, state = 'DONE') {
    const data = {
      name,
      state,
      user: batchDownload.user,
      properties: { batchDownload }
    }
    // Mock the `runBatchDownload` method
    const spy = jest.spyOn(Api.prototype, 'runBatchDownload')
      .mockImplementation(Promise.resolve(data))
    return { batchDownload, name, state, spy }
  }

  function mockDeleteBatchDownload (name = 'BatchDownloadTask', batchDownload = {}, state = 'DONE') {
    // Mock the `deleteTask` method
    const spy = jest.spyOn(Api.prototype, 'deleteTask')
      .mockImplementation(Promise.resolve(true))
    return { batchDownload, name, state, spy }
  }

  function mockFailToDeleteBatchDownload (name = 'BatchDownloadTask', batchDownload = {}, state = 'RUNNING') {
    // Mock the `deleteTask` method
    const spy = jest.spyOn(Api.prototype, 'deleteTask')
      .mockImplementation(Promise.reject(new Error('')))
    return { batchDownload, name, state, spy }
  }

  beforeEach(async () => {
    await flushPromises()
    // Then clear all mocks
    jest.clearAllMocks()
  })

  describe('relaunchTask method', () => {
    it('should emit an error when the relaunch fails', async () => {
      const query = ';ERRORED;'
      const { batchDownload: value } = mockRunBatchDownload('erroredTask', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunchTask()
      expect(wrapper.emitted('reluanchFailed'))
    })

    it('should emit a success when the relaunch', async () => {
      const query = '{ }'
      const { batchDownload: value } = mockRunBatchDownload('task', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunchTask()
      expect(wrapper.emitted('reluanched'))
    })

    it('should call the API with a parsed query', async () => {
      const query = '{ "foo": "bar" }'
      const { batchDownload: value, spy } = mockRunBatchDownload('task', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunchTask()
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ query: { foo: 'bar' } }))
    })

    it('should call the API with a list of projects', async () => {
      const { batchDownload: value, spy } = mockRunBatchDownload('task', { projects })
      const propsData = { value }
      const projectIds = ['project']
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunchTask()
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ projectIds }))
    })
  })

  describe('parsing query to searchRoute', () => {
    it('with contentType and extractionLevel filters', async () => {
      const query = JSON.stringify({
        bool: {
          filter: {
            bool: {
              must: [
                {
                  terms: {
                    contentType: ['application/pdf']
                  }
                },
                {
                  terms: {
                    extractionLevel: ['0']
                  }
                }
              ]
            }
          }
        }
      })
      const { batchDownload: value } = mockRunBatchDownload('task', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.vm.searchRoute.query['f[contentType]']).toContain('application/pdf')
      expect(wrapper.vm.searchRoute.query['f[extractionLevel]']).toContain('0')
    })

    it('with two extractionLevel filters', async () => {
      const query = JSON.stringify({
        bool: {
          filter: {
            bool: {
              must: [
                {
                  terms: {
                    extractionLevel: ['0', '1']
                  }
                }
              ]
            }
          }
        }
      })
      const { batchDownload: value } = mockRunBatchDownload('task', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.vm.searchRoute.query['f[extractionLevel]']).toContain('0')
      expect(wrapper.vm.searchRoute.query['f[extractionLevel]']).toContain('1')
    })

    it('with a query string', async () => {
      const query = JSON.stringify({
        bool: {
          must: [
            {
              match_all: {}
            },
            {
              bool: {
                should: [
                  {
                    query_string: {
                      query: 'FOO'
                    }
                  }
                ]
              }
            },
            {
              match: {
                type: 'Document'
              }
            }
          ]
        }
      })
      const { batchDownload: value } = mockRunBatchDownload('task', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.vm.searchRoute.query.q).toContain('FOO')
    })

    it('with a contentType negative filter', async () => {
      const query = JSON.stringify({
        bool: {
          filter: {
            bool: {
              must: [
                {
                  terms: {
                    extractionLevel: ['0']
                  }
                }
              ],
              must_not: [
                {
                  terms: {
                    contentType: ['application/pdf']
                  }
                }
              ]
            }
          }
        }
      })
      const { batchDownload: value } = mockRunBatchDownload('task', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.vm.searchRoute.query['f[-contentType]']).toContain('application/pdf')
    })

    it('with extractionLevel filter and contentType negative filter ', async () => {
      const query = JSON.stringify({
        bool: {
          filter: {
            bool: {
              must: [
                {
                  terms: {
                    extractionLevel: ['0']
                  }
                }
              ],
              must_not: [
                {
                  terms: {
                    contentType: ['application/pdf']
                  }
                }
              ]
            }
          }
        }
      })
      const { batchDownload: value } = mockRunBatchDownload('task', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.vm.searchRoute.query['f[extractionLevel]']).toContain('0')
      expect(wrapper.vm.searchRoute.query['f[-contentType]']).toContain('application/pdf')
    })

    it('with project', async () => {
      const { batchDownload: value } = mockRunBatchDownload('task', { projects })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.vm.searchRoute.query.indices).toContain('project')
    })

    it('with a language filter', async () => {
      const query = JSON.stringify({
        bool: {
          filter: {
            terms: {
              language: [
                'GERMAN'
              ]
            }
          },
          must: [
            {
              match_all: {}
            },
            {
              bool: {
                should: [
                  {
                    query_string: {
                      query: '*'
                    }
                  }
                ]
              }
            },
            {
              match: {
                type: 'Document'
              }
            }
          ]
        }
      })
      const { batchDownload: value } = mockRunBatchDownload('task', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.vm.searchRoute.query['f[language]']).toContain('GERMAN')
      expect(wrapper.vm.searchRoute.query.q).toContain('*')
    })

    it.skip('with a very complexe query', async () => {
      const query = JSON.stringify({
        bool: {
          filter: {
            bool: {
              must: [
                {
                  terms: {
                    contentType: [
                      'application/pdf'
                    ]
                  }
                },
                {
                  terms: {
                    extractionLevel: [
                      '0'
                    ]
                  }
                }
              ]
            }
          },
          must: [
            {
              bool: {
                should: [
                  {
                    range: {
                      'metadata.tika_metadata_creation_date': {
                        gte: '2004-01-01T11:19:08.555Z',
                        lte: '2039-12-31T11:19:09.995Z'
                      }
                    }
                  }
                ]
              }
            },
            {
              bool: {
                should: [
                  {
                    term: {
                      'dirname.tree': '/home/dev/Datashare/90ST'
                    }
                  },
                  {
                    term: {
                      'dirname.tree': '/home/dev/datashare/90st'
                    }
                  }
                ]
              }
            },
            {
              bool: {
                should: [
                  {
                    range: {
                      extractionDate: {
                        gte: '2022-08-01T00:00:00.000Z',
                        lte: '2022-08-31T23:59:59.999Z'
                      }
                    }
                  }
                ]
              }
            },
            {
              match_all: {}
            },
            {
              bool: {
                should: [
                  {
                    query_string: {
                      query: '*'
                    }
                  }
                ]
              }
            },
            {
              match: {
                type: 'Document'
              }
            }
          ]
        }
      })
      const { batchDownload: value } = mockRunBatchDownload('task', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.vm.searchRoute.query['f[extractionLevel]']).toContain('0')
      expect(wrapper.vm.searchRoute.query['f[contentType]']).toContain('application/pdf')
      expect(wrapper.vm.searchRoute.query['f[creationDate]']).toContain('1072955948555')
      expect(wrapper.vm.searchRoute.query['f[creationDate]']).toContain('2208943149995')
      expect(wrapper.vm.searchRoute.query['f[path]']).toContain('/home/dev/Datashare/90ST')
      expect(wrapper.vm.searchRoute.query['f[indexingDate]']).toContain('1659312000000')
      expect(wrapper.vm.searchRoute.query.q).toContain('*')
    })
  })

  describe('deleteTask method', () => {
    it('should emit an error when the delete fails', async () => {
      const { name, batchDownload: value } = mockFailToDeleteBatchDownload('failing')
      const propsData = { name, value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.deleteTask()
      expect(wrapper.emitted('deleteFailed'))
    })

    it('should emit a success when the delete', async () => {
      const { name, batchDownload: value } = mockDeleteBatchDownload('successful')
      const propsData = { name, value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.deleteTask()
      expect(wrapper.emitted('deleted'))
    })
  })
})
