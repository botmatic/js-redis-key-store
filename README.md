# JS Redis KeyStore
A module to manage id associations in @botmatic/js-contact in a redis database.  
It implements the KeyStore interface defined by @botmatic/js-contact

## Installation
```bash
npm install redis js-redis-key-store --save
```

## Usage

### Initialisation
```javascript
const redis = require('redis')
const client = redis.createClient(your_client_options)

const keyStore = require('js-redis-key-store')(client)
```

### Methods
As you'd typically use this module with js-contact, you'd normally do not have to call any of these methods directly.

#### `saveIds(integrationId, botmaticId, externalId) -> Promise<boolean>`
Saves a botmatic/external ids pair for an integration.
Called when a `CONTACT_CREATED `event is received, when `js-contact::createContact()` or `js-contact::importContacts()` are called.  
Returns a `Promise` which resolves to `true` if the save was successful, `false` if it fails.

##### Parameters

parameter | type | description
--- | --- | --- 
integrationId | string | An identifier for the integration, makes this association unique
botmaticId | string | The resource id on Botmatic
externalId | string | The resource id on the external API


##### Example using async / await
```javascript
const saved = await keyStore.saveIds(integrationId, botmaticId, externalId)
// saved == true if success, false if it fails
```

##### Example using Promises
```javascript
  keyStore.saveIds(integrationId, botmaticId, externalId)
  .then(saved => {
    // saved == true if success, false if it fails
  })
```

#### `getBotmaticId(integrationId, externalId) -> Promise<string | null>`
Gives the resource id on Botmatic associated with the given integrationId and external id.  
Called when `js-contact::updateContact()` is called.  
Returns a `Promise` which resolves to the botmatic id or `null` if none is found.

##### Parameters

parameter | type | description
--- | --- | --- 
integrationId | string | An identifier for the integration
externalId | string | The resource id on the external API

##### Example using async / await
```javascript
const botmaticId = await keyStore.getBotmaticId(integrationId, externalId)
```

##### Example using Promises
```javascript
  keyStore.getBotmaticId(integrationId, externalId)
  .then(botmaticId => {
    //
  })
```

#### `getExtId(integrationId, botmaticId) -> Promise<string | null>`
Gives the external resource id associated with the given integrationId and botmatic id.  
Called when a `CONTACT_UPDATED` is received.  
Returns a `Promise` which resolves to the external id or `null` if none is found.

##### Parameters

parameter | type | description
--- | --- | --- 
integrationId | string | An identifier for the integration
botmaticId | string | The resource id on Botmatic

##### Example using async / await
```javascript
const externalId = await keyStore.getExtId(integrationId, botmaticId)
```

##### Example using Promises
```javascript
  keyStore.getExtId(integrationId, botmaticId)
  .then(externalId => {
    //
  })
```

#### `deleteIds(integrationId, botmaticId, extId) -> Promise<boolean>`
Remove a botmatic/external id pair for a given integration id.  
Called when a `CONTACT_DELETED` event is received and when `js-contact::deleteContact()` is called.  
Returns a `Promise` which resolves to `true` if the deletion was successful, `false` if it fails.

##### Parameters

parameter | type | description
--- | --- | --- 
integrationId | string | An identifier for the integration
botmaticId | string | The resource id on Botmatic
externalId | string | The resource id on the external API

##### Example using async / await
```javascript
const deleted = await keyStore.deleteIds(integrationId, botmaticId, externalId)
// deleted == true if success, false if it fails
```

##### Example using Promises
```javascript
  keyStore.deleteIds(integrationId, botmaticId, externalId)
  .then(deleted => {
    // deleted == true if success, false if it fails
  })
```

#### `deleteAllIds(integrationId) -> Promise<boolean>`
Remove a botmatic/external id pair for a given integration id.
Called when a `UNINSTALL` event is received.  
Returns a `Promise` which resolves to `true` if the deletion was successful, `false` if it fails.

##### Parameters

parameter | type | description
--- | --- | --- 
integrationId | string | An identifier for the integration

##### Example using async / await
```javascript
const deleted = await keyStore.deleteAllIds(integrationId)
// deleted == true if success, false if it fails
```

##### Example using Promises
```javascript
  keyStore.deleteAllIds(integrationId)
  .then(deleted => {
    // deleted == true if success, false if it fails
  })
```

#### `quit()`
Quits the redis client
