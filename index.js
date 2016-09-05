import JWT from './util/jwt'

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

        getStorageKey(part) {

            return this.storagePrefix + part

        },

        setUserData(data) {

            this.userData = data;

            return localStorage.setItem(this.getStorageKey('user'), JSON.stringify(data));

        },

        getUserData() {

            return JSON.parse(localStorage.getItem(this.getStorageKey('user')))

        },

        setToken(token) {

            return localStorage.setItem(this.getStorageKey('token'), token)

        },

        getToken() {

            return localStorage.getItem(this.getStorageKey('token'))

        },

        removeToken() {

            return localStorage.removeItem(this.getStorageKey('token'))

        },

        hasToken() {

            return this.getToken() !== null

        },

        isAuthenticated() {

            return ! JWT.isExpired(this.getToken());

        },

        installInterceptor(instance) {

            if (typeof Vue.http === 'undefined') {
                throw new Error('Please install vue-resource before attempting to install the interceptor.');
            }

            return (request, next) => {
                request.headers['Authorization'] = 'Bearer ' + this.getToken();

                next(response => {
                    if (response.status === 401) {
                        instance.$auth.setToken(undefined);

                        if (instance.$auth.redirectType === 'browser') {
                            window.location.href = instance.$auth.authPath;
                        }
                        else {
                            instance.$router.go(instance.$auth.authPath);
                        }
                    }

                    return response;
                });
            }
        }

    };

    Object.defineProperties(Vue.prototype, {

        $auth: {
            get() {
                return Vue.auth;
            }
        }

    });

}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(plugin);
}

export default plugin
