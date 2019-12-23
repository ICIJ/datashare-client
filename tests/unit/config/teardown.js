module.exports = async function () {
  // close the HTTP instance
  await global.__SERVER_GLOBAL__.close()
}
