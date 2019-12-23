const httpServer = require('http-server')

module.exports = async function () {
  const server = httpServer.createServer({ root: 'tests/unit/resources' })
  server.listen(9876)
  // store the HTTP server instance so we can teardown it later
  global.__SERVER_GLOBAL__ = server
}
