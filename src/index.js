/**
 * An implementation of KeyStore using Redis
 * @module js-redis-key-store
 * @requires module:redis
 * @implements KeyStore
 * @example
 * // INITIALISATION
 *
 * const redis = require('redis')
 * const keyStore = require('js-redis-key-store')(redis.createClient())
 * @example
 * // Saving Botmatic/External ids pairs
 *
 * const ok = await keyStore.saveIds(INTEGRATION_ID, 123, 234)
 * // ok == true
 * @example
 * // Fetching an external id
 *
 * const externalId = await keyStore.getBotmaticId(INTEGRATION_ID, 123)
 * // externalId == 234
 * @example
 * // Fetching a botmatic id
 *
 * const botmaticId = await keyStore.getBotmaticId(INTEGRATION_ID, 234)
 * // botmaticId == 123
 * @example
 * // Deleting a botmatic/external id pair
 *
 * const ok = await keyStore.deleteIds(INTEGRATION_ID, 123, 234)
 * // ok == true
 */

const debug = require('debug')('botmatic:js-redis-key-store')

/****************************/
/* Key utils                */
/****************************/

const buildBotmaticKey = (integrationId, botmaticId) => `${integrationId}:b:${botmaticId}`
const buildExternalKey = (integrationId, externalId) => `${integrationId}:e:${externalId}`

// const buildKey = (integrationId, botmaticId, extId) => `${integrationId}_${botmaticId}_${extId}`
// const botmaticPattern = (integrationId, botmaticId) => `${integrationId}:b${botmaticId}_*`
// const externalPattern = (integrationId, extId) => `${integrationId}_*_${extId}`

const botmaticIdInKey = key => key.split('_')[1]
const externalIdInKey = key => key.split('_')[2]
const integrationIdInKey = key => key.split('_')[0]

/***************************/
/* Internal functions      */
/***************************/

const _saveId = (storage, key, id) => new Promise(resolve => {
  storage.set(key, id, (err, value) => {
    debug("set", key, id, err, value)
    resolve(value === "OK")
  })
})


const _getId = (storage, key) => new Promise(resolve => {
  storage.get(key, (err, value) => {
    debug("get", key, err, value)
    resolve(value)
  })
})

const _delId = (storage, key) => new Promise(resolve => {
  storage.del(key, (err, value) => {
    resolve(value > 0)
  })
})

const _allPromisesTrue = promises => {
  return new Promise(resolve => {
    Promise.all(promises)
      .then(values => {
        const ok = values.reduce((acc, value) => acc === true && value === true, true)
        resolve(ok)
      })
  })
}

const _saveIds = async (storage, integrationId, botmaticId, extId) => {
  // const key = buildKey(integrationId, botmaticId, extId)
  const botmaticKey = buildBotmaticKey(integrationId, botmaticId)
  const externalKey = buildExternalKey(integrationId, extId)

  if (botmaticKey && externalKey) {

    const promises = [
      await _saveId(storage, botmaticKey, extId),
      await _saveId(storage, externalKey, botmaticId)
    ]

    return _allPromisesTrue(promises)
  }
  else {
    return false
  }
}

const _getBotmaticId =  (storage, integrationId, extId) => {
  const externalKey = buildExternalKey(integrationId, extId)
  return _getId(storage, externalKey)
}

const _getExtId = async (storage, integrationId, botmaticId) => {
  const botmaticKey = buildBotmaticKey(integrationId, botmaticId)
  return _getId(storage, botmaticKey)
}

const _deleteIds = async (storage, integrationId, botmaticId, extId) => {
  const botmaticKey = buildBotmaticKey(integrationId, botmaticId)
  const externalKey = buildExternalKey(integrationId, extId)

  const promises = [
    await _delId(storage, botmaticKey),
    await _delId(storage, externalKey)
  ]

  return _allPromisesTrue(promises)
}

const _deleteAllIds = (storage, integrationId) =>
  new Promise(resolve => {
    storage.keys(`${integrationId}:*`, (err, keys) => {
      if (!err) {
        storage.del(keys, (err, nDeleted) => {
          console.log(`${nDeleted} keys removed`)
          resolve(true)
        })
      }
      else {
        resolve(false)
      }
    })
  })

/**********************************/
/* Module definition              */
/**********************************/

const init = (storage) => ({
  /**
   * Saves a botmatic/external ids pair for an integration
   * Returns a Promise which resolves to true if the save was successful, false if it fails
   * @param {string} integrationId
   * @param {string} botmaticId
   * @param {string} extId
   * @returns {Promise<boolean>}
   */
  saveIds: (integrationId, botmaticId, extId) => _saveIds(storage, integrationId, botmaticId, extId),
  /**
   * Fetches the botmatic id for a given external id, and integration
   * Returns a Promise which resolves to the botmatic id or null if none is found
   * @param {string} integrationId
   * @param {string} extId
   * @return {Promise<string|null>}
   */
  getBotmaticId: (integrationId, extId) => _getBotmaticId(storage, integrationId, extId),
  /**
   * Fetches the external id for a given botmatic id, and integration
   * Returns a Promise which resolves to the external id, or null if none is found
   * @param {string} integrationId
   * @param {string} botmaticId
   * @return {Promise<string|null>}
   */
  getExtId: (integrationId, botmaticId) => _getExtId(storage, integrationId, botmaticId),
  /**
   * Deletes a botmatic/external id pair for an integration
   * Returns a Promise which resolves to `true` if more than one row was deleted
   * @param {string} integrationId
   * @param {string} botmaticId
   * @param {string} extId
   * @return {Promise<boolean>}
   */
  deleteIds: (integrationId, botmaticId, extId) => _deleteIds(storage, integrationId, botmaticId, extId),
  /**
   * Deletes all botmatic/external id pairs for an integration
   * Returns a Promise which resolves to `true` if no errors
   * @param integrationId
   * @return {Promise<boolean>}
   */
  deleteAllIds: (integrationId) => _deleteAllIds(storage, integrationId),
  quit: () => storage.quit()
})

module.exports = init