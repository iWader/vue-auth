/*!
 * vue-auth v1.0.0-alpha.1
 * (c) 2016 Wade Urry
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.VueAuth = factory());
}(this, (function () { 'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var base64 = createCommonjsModule(function (module, exports) {
  (function () {

    var object = typeof exports != 'undefined' ? exports : self; // #8: web workers
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    function InvalidCharacterError(message) {
      this.message = message;
    }
    InvalidCharacterError.prototype = new Error();
    InvalidCharacterError.prototype.name = 'InvalidCharacterError';

    // encoder
    // [https://gist.github.com/999166] by [https://github.com/nignag]
    object.btoa || (object.btoa = function (input) {
      var str = String(input);
      for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next str index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      str.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
        charCode = str.charCodeAt(idx += 3 / 4);
        if (charCode > 0xFF) {
          throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        }
        block = block << 8 | charCode;
      }
      return output;
    });

    // decoder
    // [https://gist.github.com/1020396] by [https://github.com/atk]
    object.atob || (object.atob = function (input) {
      var str = String(input).replace(/=+$/, '');
      if (str.length % 4 == 1) {
        throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
      }
      for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = str.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      // and if not first of each 4 characters,
      // convert the first 8 bits to one ascii character
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        // try to find character in table (0-63, not found => -1)
        buffer = chars.indexOf(buffer);
      }
      return output;
    });
  })();
});

var JWT = {
    decode: function decode(token) {

        var parts = token.split('.');

        var encoded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        switch (encoded.length % 4) {
            case 0:
                break;
            case 2:
                encoded += '==';
                break;
            case 3:
                encoded += '=';
                break;
        }

        return JSON.parse(decodeURIComponent(base64.atob(encoded)));
    },
    getDeadline: function getDeadline(token) {

        var decoded = this.decode(token);

        if (typeof decoded.exp === 'undefined') return null;

        var deadline = new Date(0);

        deadline.setUTCSeconds(decoded.exp);

        return deadline;
    },
    isExpired: function isExpired(token) {

        var deadline = this.getDeadline(token);

        if (deadline === null) return false;

        var now = new Date();

        return deadline.valueOf() <= now.valueOf();
    }
};

function plugin(Vue, options) {

    if (plugin.installed) {
        return;
    }

    options = options || {};

    Vue.auth = {

        storagePrefix: options.storagePrefix || '_auth.',
        redirectType: options.redirectType || 'router',
        authPath: options.authPath || '/login',
        userData: undefined,

        getStorageKey: function getStorageKey(part) {

            return this.storagePrefix + part;
        },
        setUserData: function setUserData(data) {

            this.userData = data;

            return localStorage.setItem(this.getStorageKey('user'), JSON.stringify(data));
        },
        getUserData: function getUserData() {

            return JSON.parse(localStorage.getItem(this.getStorageKey('user')));
        },
        setToken: function setToken(token) {

            return localStorage.setItem(this.getStorageKey('token'), token);
        },
        getToken: function getToken() {

            return localStorage.getItem(this.getStorageKey('token'));
        },
        removeToken: function removeToken() {

            return localStorage.removeItem(this.getStorageKey('token'));
        },
        hasToken: function hasToken() {

            return this.getToken() !== null;
        },
        isAuthenticated: function isAuthenticated() {

            return !JWT.isExpired(this.getToken());
        },
        installInterceptor: function installInterceptor(instance) {
            var _this = this;

            if (typeof Vue.http === 'undefined') {
                throw new Error('Please install vue-resource before attempting to install the interceptor.');
            }

            return function (request, next) {
                request.headers['Authorization'] = 'Bearer ' + _this.getToken();

                next(function (response) {
                    if (response.status === 401) {
                        instance.$auth.setToken(undefined);

                        if (instance.$auth.redirectType === 'browser') {
                            window.location.href = instance.$auth.authPath;
                        } else {
                            instance.$router.go(instance.$auth.authPath);
                        }
                    }

                    return response;
                });
            };
        }
    };

    Object.defineProperties(Vue.prototype, {

        $auth: {
            get: function get() {
                return Vue.auth;
            }
        }

    });
}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(plugin);
}

return plugin;

})));
