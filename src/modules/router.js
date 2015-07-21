/**
 * Created by thram on 20/07/15.
 */
thram.router = (function () {
    var _routes = {};

    function go(route) {
        if (thram.templates) {
            window.location.hash = '#' + route;
        } else {
            window.location.href = route;
        }
    }

    function process() {
        var BreakException = {};
        try {
            thram.routes.forEach(function (route) {
                var routeMatcher = new RegExp(route.route.replace(/:[^\s/]+/g, '([\\w-]+)'));
                var url = window.location.pathname;
                if (thram.templates && window.location.hash != '') {
                    var hash = window.location.hash;
                    if (hash.indexOf('#/') === 0) {
                        url = hash.substr(hash.indexOf('#') + 1);
                    } else {
                        thram.views.scrollTo(hash);
                    }
                }

                var match = url.match(routeMatcher);
                if (match && match.length > 0 && match[0] === url) {
                    var params = {};
                    if (route.route.indexOf(':') >= 0) {
                        var keys = route.route.match(/:(.+?)(\/|\?|$)/g);
                        if (keys) {
                            keys = keys.join('&').replace(/:/g, '').replace(/\//g, '').split('&');
                            var values = match;
                            keys.forEach(function (key, i) {
                                params[key] = values[i];
                            });
                        }
                    }

                    // Validation to restrict the access to the route

                    route.validate ?
                        (route.validate.validation() ? thram.render.view(route.view, params) : route.validate.onValidationFail())
                        : thram.render.view(route.view, params);

                    throw BreakException;
                }
            });
        } catch (e) {
            if (e !== BreakException) throw e;
        }
    }

    function register(route, options) {
        if (!options.view) throw {
            code: 'no-view',
            name: "No View attached",
            message: "There is no View attached to the route. Please add one. Ex.: thram.router.register('/', {view: 'viewId' }"
        };
        _routes[route] = options;
    }

    return {
        clientSideRouting: false,
        register: register,
        go: go,
        process: process
    }
})();