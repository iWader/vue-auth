/*!
 * vue-auth v0.4.0
 * (c) 2016 Wade Urry
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('Base64')) :
    typeof define === 'function' && define.amd ? define(['Base64'], factory) :
    (global.vue-auth = factory(global.Base64));
}(this, (function (Base64) { 'use strict';

Base64 = 'default' in Base64 ? Base64['default'] : Base64;

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

        return JSON.parse(decodeURIComponent(Base64.atob(encoded)));
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
