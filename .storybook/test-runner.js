/** @type {import('@storybook/test-runner').TestRunnerConfig} */
const config = {
  // Fail a story if it rendered Storybook's error overlay.
  async postVisit(page) {
    const errorText = await page.evaluate(() => {
      const overlay = document.querySelector('#error-message, .sb-errordisplay')
      return overlay ? overlay.textContent : ''
    })
    if (errorText) {
      throw new Error(`Story rendered an error overlay: ${errorText.slice(0, 300)}`)
    }
  }
}

export default config
