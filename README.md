# vue-auth

[![CircleCI](https://img.shields.io/circleci/project/iWader/vue-auth/master.svg)](https://circleci.com/gh/iWader/vue-auth) [![NPM](https://img.shields.io/npm/v/vue-auth.svg)](https://www.npmjs.com/package/vue-auth)

Vue plugin for easily managing your app's auth state

    This is a work in progress and the API may change without notice
    
## Installation

```javascript
npm require vue-auth --save
```

```javascript
var Vue = require('vue')
var VueAuth = require('vue-auth')

Vue.use(VueAuth)
```

## Usage

To access the auth object you'll find the `$auth` property on your application instance. (e.g `this.$auth.getToken()`)

#### Options

 - `storagePrefix` - Prefix to the storage keys used in localStorage
 - `authPath` - URI the user should be redirected to to re-authenticate
 - `redirectType` - May be either `router` or `browser`. Which method should the user be redirected with?
 
Setting options is done the same as all Vue plugins.

```javascript
Vue.use(VueAuth, {
  storagePrefix: '_prefix.',
  redirectType: 'browser'
})
```

##### Methods

 - `getToken()`
 - `setToken(token)`
 - `removeToken()`
 - `hasToken()`
 - `isAuthenticated()`
 - `getUserData()`
 - `setUserData(data)`

## Licence

Copyright (c) 2016 Wade Urry - Released under the [MIT Licence](LICENCE.md)

