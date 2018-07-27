import { expect } from 'chai'
import sinon from 'sinon'
import { DatashareClient } from '@/api/DatashareClient'
import fetchPonyfill from 'fetch-ponyfill'

const { Response } = fetchPonyfill()
const ds = new DatashareClient()

describe('Datashare backend client', () => {
  beforeEach(() => {
    sinon.stub(ds, 'fetch')
    sinon.stub(ds, 'redirectToAuth')
  })

  afterEach(() => {
    ds.fetch.restore()
    ds.redirectToAuth.restore()
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
    sinon.assert.calledOnce(ds.redirectToAuth)
  })
})

function fetchReturns (status, json) {
  ds.fetch.returns(Promise.resolve(new Response(JSON.stringify(json), {
    status: status,
    headers: {
      'Content-type': 'application/json'
    }
  })))
}
