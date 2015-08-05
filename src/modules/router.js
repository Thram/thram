/**
 * Created by thram on 20/07/15.
 *
 * Router Module
 *
 * It handles Client-Side (attaching a template to the view)
 * and Server-Side routing (triggering the view controller depending on
 * the route for an easy integration with server-side rendering)
 *
 * Dependencies:
 * thram
 * thram.exceptions
 * thram.toolbox
 *
 * (Optional) thram.templates // The module + the clientSideRouting flag enable Client Side Routing
 *
 */

(function () {
    window.thram        = window.thram || {};
    window.thram.router = (function () {
        var _RouterApi   = {},
            _routes      = {},
            _currentView = undefined,
            _templates   = window.thram.templates,
            _exceptions  = window.thram.exceptions,
            _toolbox     = window.thram.toolbox,
            _render      = window.thram.render;

        _RouterApi.go = function (route) {
            if (_RouterApi.clientSideRouting && _templates) {
                window.location.hash = '#' + route;
            } else {
                window.location.href = route;
            }
        };

        _RouterApi.process = function () {
            var BreakException = {};
            try {
                for (var _route in _routes) {

                    var routeMatcher = new RegExp(_route.replace(/:[^\s/]+/g, '([\\w-]+)')),
                        url          = window.location.pathname,
                        urlParams    = [],
                        state        = undefined;
                    if (_RouterApi.clientSideRouting && _templates) {
                        url       = window.location.hash || '/';
                        urlParams = url.split('#');
                        if (urlParams.length > 1) {
                            if (urlParams[1].indexOf('/') === 0) {
                                url   = urlParams[1];
                                state = urlParams[2];
                            } else {
                                url   = '/';
                                state = urlParams[1];
                            }
                        }
                    }

                    var match = url.match(routeMatcher);
                    if (match && match.length > 0 && match[0] === url) {
                        var params = {};
                        if (_route.indexOf(':') >= 0) {
                            var keys = _route.match(/:(.+?)(\/|\?|$)/g);
                            if (keys) {
                                keys       = keys.join('&').replace(/:/g, '').replace(/\//g, '').split('&');
                                var values = match;
                                keys.forEach(function (key, i) {
                                    params[key] = values[i];
                                });
                            }
                        }

                        var _routeSettings = _routes[_route];
                        var view           = _toolbox.isString(_routeSettings.view) ? {id: _routeSettings.view} : _routeSettings.view;

                        if (view.id === _currentView && state) {
                            thram.render.state(view.id, state, _routeSettings.states[state]);
                        } else {
                            _currentView = view.id;
                            // Validation to restrict the access to the route
                            _routeSettings.validate ?
                                (_routeSettings.validate.validation() ? _render.view(view.id, view.data) : _routeSettings.validate.onValidationFail())
                                : _render.view(view.id, view.data);
                            state && thram.render.state(view.id, state, _routeSettings.states[state]);
                        }

                        throw BreakException;
                    }
                }
            } catch (e) {
                if (e !== BreakException) throw e;
            }
        };

        _RouterApi.register = function (route, settings) {
            if (!settings.view) throw _exceptions.no_view;
            _routes[route] = settings;
        };

        _RouterApi.onStateChange = function (callback) {
            window.addEventListener("hashchange", callback, false);
        };

        _RouterApi.clientSideRouting = true;

        return _RouterApi;
    })();
})();