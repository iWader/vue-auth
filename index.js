function defaultCallback(token) {
    return token !== null;
}

function plugin(Vue, options) {

    if (plugin.installed) {
        return;
    }

    options = options || {};

    Vue.auth = {

        storageKey: options.storageKey || '_auth.token',
        callback: options.authCallback || defaultCallback,
        redirectType: options.redirectType || 'router',
        authPath: options.authPath || '/login',

        setToken(token) {

            return localStorage.setItem(this.storageKey, token)

        },

        getToken() {

            return localStorage.getItem(this.storageKey)

        },

        hasToken() {

            return this.getToken() !== null

        },

        isAuthenticated() {

            return this.callback(this.getToken())

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
