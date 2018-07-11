import { DatashareClient } from '@/api/DatashareClient'

describe('Datashare backend client', () => {
  var ds = new DatashareClient()

  beforeEach(() => {
    sinon.stub(window, 'fetch')
    sinon.stub(window.location, 'assign')
  })

  afterEach(() => {
    window.fetch.restore()
    window.location.assign.restore()
  })

  it('should return backend response to createIndex', async () => {
    fetchReturns(200, {})
    let resp = await ds.createIndex()
    let json = await resp.json()
    expect(json).to.deep.equal({})
  })

  it('should redirect to signin page if backend response to createIndex is 401', async () => {
    fetchReturns(401, {})
    await ds.createIndex()
    sinon.assert.calledOnce(window.location.assign)
    expect(window.location.assign.getCall(0).args).to.deep.equal(['http://localhost:9876' + process.env.CONFIG.ds_auth_signin])
  })
})

function fetchReturns (status, json) {
  window.fetch.returns(Promise.resolve(new window.Response(JSON.stringify(json), {
    status: status,
    headers: {
      'Content-type': 'application/json'
    }
  })))
}
