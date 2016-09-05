import Vue from 'vue'
import VueAuth from '../index'
import JWT from '../util/jwt'

Vue.use(VueAuth);

describe('vue-auth', function() {
    afterEach(function () {
        localStorage.removeItem('_auth.token')
        localStorage.removeItem('_auth.user')
        localStorage.removeItem('_prefix.token')
        localStorage.removeItem('_prefix.user')
    });

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

        const dataIn = {name: 'Jane Doe', age: 20};

        vm.$auth.setUserData(dataIn);

        const dataOut = vm.$auth.getUserData();

        expect(dataOut.name).toBeDefined();
        expect(dataOut.name).toEqual('Jane Doe');
        expect(dataOut.age).toBeDefined();
        expect(dataOut.age).toEqual(20);
    })

    it('to detect is has a token stored', function() {
        var vm = new Vue();

        expect(vm.$auth.hasToken()).toBe(false);

        vm.$auth.setToken('kebab-news-thing');

        expect(vm.$auth.hasToken()).toBe(true);
    })
})

describe('JWT Helper', function() {
    it('to decode a valid token', function() {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOjEsIm5hbWUiOiJKYW5lIERvZSJ9.F0aM7iXee139nQE4FD5Lw5l89NxkKuFJ_2iU09MNYUk"
        const decoded = JWT.decode(token);

        expect(decoded.aud).toBeDefined()
        expect(decoded.aud).toBe(1)
        expect(decoded.name).toBeDefined()
        expect(decoded.name).toBe('Jane Doe')
    })

    it('to decode and convert the expiry time', function() {
        // Exp: 2524608000
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxIiwiZXhwIjoyNTI0NjA4MDAwfQ.egn6G7vB80nH3NwlgUZ9bwUAlLnkEV8kR8PN0edKCJI"

        // Missing exp property
        const missing = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxIn0.ClQFOEhtNQtmx71eSzmUhW1lfs9LHGCsT-Y4v8LHE5k"

        expect(JWT.getDeadline(token).getTime()).toBe(2524608000000)
        expect(JWT.getDeadline(missing)).toBe(null)
    })

    it('to correctly test if a token has expired', function() {
        // Expired in 2000
        const expired = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxIiwiZXhwIjo5NDY2ODQ4MDB9.4DPaehBA1-6ll6E6xiSpGjqv9P9X1yOCj1-I6tyyuv8"

        // Expires in 2050
        const unexpired = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxIiwiZXhwIjoyNTI0NjA4MDAwfQ.egn6G7vB80nH3NwlgUZ9bwUAlLnkEV8kR8PN0edKCJI"

        // Missing exp property
        const missing = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxIn0.ClQFOEhtNQtmx71eSzmUhW1lfs9LHGCsT-Y4v8LHE5k"

        expect(JWT.isExpired(expired)).toBe(true)
        expect(JWT.isExpired(unexpired)).toBe(false)
        expect(JWT.isExpired(missing)).toBe(false)
    })
})