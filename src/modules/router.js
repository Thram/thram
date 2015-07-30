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
                if (thram.router.clientSideRouting) {
                    url = window.location.hash || '/';
                    if (url.indexOf('#') === 0) {
                        if (url.indexOf('#/') === 0) {
                            url = url.substr(url.indexOf('#') + 1);
                        } else {
                            thram.views.scrollTo(url);
                        }
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

                    var view = thram.toolbox.isString(route.view) ? {id: route.view} : route.view;

                    // Validation to restrict the access to the route
                    route.validate ?
                        (route.validate.validation() ? thram.render.view(view.id, view.data) : route.validate.onValidationFail())
                        : thram.render.view(view.id, view.data);

                    throw BreakException;
                }
            });
        } catch (e) {
            if (e !== BreakException) throw e;
        }
    }

    function register(route, options) {
        if (!options.view) throw thram.exceptions.no_view;
        _routes[route] = options;
    }

    return {
        clientSideRouting: true,
        register: register,
        go: go,
        process: process
    };
})();