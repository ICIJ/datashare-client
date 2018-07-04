import {DatashareClient} from '@/api/datashare'

describe('datashare backend', () => {
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
    ds.createIndex().then(resp => resp.json().then(j => expect(j).to.deep.equal({})))
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
