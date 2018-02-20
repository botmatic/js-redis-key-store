const expect = require('chai').expect
const storage = require('redis').createClient({db: 2})
const keyStore = require('../src/index')(storage)

describe("JS Redis Key Store", function () {
  after(() => {
    keyStore.quit()
  })

  it("should store a key pair in the key store", async function() {
    const res = await keyStore.saveIds(0, 123, 234)

    expect(res).to.be.true
  })

  it("should read the external id from the botmatic one", async function() {

    const ok = await keyStore.saveIds(0, 123, 234)

    expect(ok).to.be.true

    const extId = await keyStore.getExtId(0, 123)

    expect(extId).to.equal("234")
  })

  it("should read the botmatic id from the external one", async function () {

    const ok = await keyStore.saveIds(0, 123, 234)

    expect(ok).to.be.true

    const botmaticId = await keyStore.getBotmaticId(0, 234)

    expect(botmaticId).to.equal("123")
  })

  it("should delete the botmatic/external ids pair", async function () {

    let ok = await keyStore.saveIds(0, 123, 234)

    expect(ok).to.be.true

    ok= await keyStore.deleteIds(0, 123, 234)

    expect(ok).to.be.true
  })
})