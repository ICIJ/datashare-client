describe('Home', () => {
  let page

  beforeAll(async () => {
    page = await global.__BROWSER__.newPage()
  })
  it('should check that backoffice is launched', async () => {
    await page.goto('http://localhost:8080/version')
    await expect(page.title()).resolves.not.toMatch('Page not found')
  })

  it('should check that frontoffice is launched', async () => {
    await page.goto('http://localhost:9090/')
    await expect(page.title()).resolves.toMatch('Datashare')
  })
})
