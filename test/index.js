import Vue from 'vue'
import VueAuth from '../index'

Vue.use(VueAuth);

describe('vue-auth', function() {
    it('to call vue constructor with no arguments', function() {
        expect(function() {
            new Vue();
        }).not.toThrow();
    });

    it('to have $auth property', function() {
        var vm = new Vue();

        expect(vm.$auth).not.toBeUndefined();
    })

    it('to return the correct storage key', function() {
        var vm = new Vue();

        expect(vm.$auth.getStorageKey('token')).toBe('_auth.token');

        vm.$auth.storagePrefix = '_prefix.';

        expect(vm.$auth.getStorageKey('user')).toBe('_prefix.user');
    });

    it('to store and retrieve an auth token', function() {
        var vm = new Vue();

        vm.$auth.setToken('kebab-news-thing');

        expect(vm.$auth.getToken()).toBe('kebab-news-thing');
    })

    it('to store and retrieve user data', function() {
        var vm = new Vue();

        const data = {name: 'Jane Doe', age: 20};

        vm.$auth.setUserData(data);

        expect(vm.$auth.getUserData()).toBe(data);
    })

    it('to detect is has a token stored', function() {
        var vm = new Vue();

        expect(vm.$auth.hasToken()).toBe(false);

        vm.$auth.setToken('kebab-news-thing');

        expect(vm.$auth.hasToken()).toBe(true);
    })
})

describe('JWT Helper', function() {

})