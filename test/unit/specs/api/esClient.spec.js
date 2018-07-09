import esClient from '@/api/esClient'
import bodybuilder from 'bodybuilder'
import { state, actions, getters, mutations } from '@/store/modules/aggregation'
import cloneDeep from 'lodash/cloneDeep'
import Vuex from 'vuex'

describe('esClient', () => {
  var server = null
  var store = null

  beforeEach(() => {
    server = sinon.fakeServer.create()
    sinon.stub(window.location, 'assign')
    store = new Vuex.Store({ state: cloneDeep(state), actions, getters, mutations })
  })

  afterEach(() => {
    server.restore()
    window.location.assign.restore()
    store.commit('clear')
  })

  it('should return backend response to a POST request for searchDocs', async () => {
    server.respondWith('POST', 'http://elasticsearch:9200/datashare-testjs/doc/_search', [200, {'Content-Type': 'application/json'}, '{"foo": "bar"}'])

    let response = await esClient.searchDocs('*')
    expect(response).to.deep.equal({ 'foo': 'bar' })
  })

  it('should redirect to signin page if searchDocs response status is 401', async () => {
    server.respondWith('POST', 'http://elasticsearch:9200/datashare-testjs/doc/_search', [401, {'Content-Type': 'application/json'}, '{"error": "unauthorized"}'])

    await esClient.searchDocs('*')
    sinon.assert.calledOnce(window.location.assign)
    expect(window.location.assign.getCall(0).args).to.deep.equal(['http://localhost:9876' + process.env.CONFIG.ds_auth_url])
  })

  it('should build a simple ES query', async () => {
    let from = 0
    let size = 25
    let body = bodybuilder().from(from).size(size)
    await esClient.addQueryToBody('*', body)

    expect(body.build()).to.deep.equal({
      from: from,
      size: size,
      query: {
        bool: {
          must: [{
            match_all: {}
          }, {
            bool: {
              should: [{
                query_string: {
                  query: '*',
                  default_field: '*'
                }}, {
                has_child: {
                  type: 'NamedEntity',
                  inner_hits: {
                    size: 30
                  },
                  query: {
                    match: {
                      mention: '*'
                    }
                  }
                }
              }]
            }
          }]
        }
      }
    })
  })

  it('should build a simple ES query and escape slash in it', async () => {
    let from = 0
    let size = 25
    let body = bodybuilder().from(from).size(size)
    await esClient.addQueryToBody('path:/home/datashare/path/*', body)

    expect(body.build()).to.deep.equal({
      from: from,
      size: size,
      query: {
        bool: {
          must: [{
            match_all: {}
          }, {
            bool: {
              should: [{
                query_string: {
                  query: 'path:\\/home\\/datashare\\/path\\/*',
                  default_field: '*'
                }}, {
                has_child: {
                  type: 'NamedEntity',
                  inner_hits: {
                    size: 30
                  },
                  query: {
                    match: {
                      mention: 'path:\\/home\\/datashare\\/path\\/*'
                    }
                  }
                }
              }]
            }
          }]
        }
      }
    })
  })
})
