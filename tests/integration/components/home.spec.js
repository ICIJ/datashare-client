describe('Home', () => {
  let page

  beforeAll(async () => {
    page = await global.__BROWSER__.newPage()
    await page.goto('http://localhost:9090/')
  })

  it('should be titled "Datashare"', async () => {
    await expect(page.title()).resolves.toMatch('Datashare')
  })
})
