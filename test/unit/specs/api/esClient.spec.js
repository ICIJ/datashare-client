import esClient from '@/api/esClient'

describe('esClient', () => {
  var server
  var redirectionUrl

  beforeEach(() => {
    server = sinon.fakeServer.create()
    sinon.stub(window.location, 'assign').callsFake(function (data) {
      redirectionUrl = data
    })
  })

  afterEach(() => {
    server.restore()
    window.location.assign.restore()
  })

  it('should return backend response to a POST request for searchDocs', async () => {
    server.respondWith('POST', 'http://elasticsearch:9200/datashare-testjs/doc/_search', [200, {'Content-Type': 'application/json'}, '{"foo": "bar"}'])

    let response = await esClient.searchDocs('*')
    expect(response).to.deep.equal({'foo': 'bar'})
  })

  it('should redirect to signin page if searchDocs response status is 401', async () => {
    server.respondWith('POST', 'http://elasticsearch:9200/datashare-testjs/doc/_search', [401, {'Content-Type': 'application/json'}, '{"error": "unauthorized"}'])

    await esClient.searchDocs('*')
    sinon.assert.calledOnce(window.location.assign)
    expect(redirectionUrl).to.equal('localhost:9876' + process.env.CONFIG.ds_auth_url)
  })
})
