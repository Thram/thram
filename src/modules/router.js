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
        var _RouterApi  = {},
            _routes     = {},
            _templates  = window.thram.templates,
            _exceptions = window.thram.exceptions,
            _toolbox    = window.thram.toolbox,
            _render     = window.thram.render;

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

                    var routeMatcher = new RegExp(_route.replace(/:[^\s/]+/g, '([\\w-]+)'));
                    var url          = window.location.pathname;
                    if (_RouterApi.clientSideRouting && _templates) {
                        url = window.location.hash || '/';
                        if (url.indexOf('#') === 0) {
                            if (url.indexOf('#/') === 0) {
                                url = url.substr(url.indexOf('#') + 1);
                            } else {
                                var el = $t('#' + url);
                                $t('body').scrollTo(el.bounds().top);
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

                        // Validation to restrict the access to the route
                        _routeSettings.validate ?
                            (_routeSettings.validate.validation() ? _render.view(view.id, view.data) : _routeSettings.validate.onValidationFail())
                            : _render.view(view.id, view.data);

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

        _RouterApi.clientSideRouting = true;

        return _RouterApi;
    })();
})();