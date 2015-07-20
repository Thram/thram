/**
 * Created by thram on 20/07/15.
 */
thram.router = (function () {
    var settings = {
        clientSide: false
    };

    function go(route) {
        if (settings.clientSide) {
            window.location.hash = '#' + route;
        } else {
            window.location.href = route;
        }
    }

    function _processView(url, route, params) {
        thram.views.base && thram.views.base.init(url, params);
        thram.views[route.view].init(url, params);
    }

    function process() {
        var BreakException = {};
        try {
            thram.routes.forEach(function (route) {
                var routeMatcher = new RegExp(route.route.replace(/:[^\s/]+/g, '([\\w-]+)'));
                var url = window.location.pathname;
                if (settings.clientSide && window.location.hash != '') {
                    var hash = window.location.hash;
                    if (hash.indexOf('#/') === 0) {
                        url = hash.substr(hash.indexOf('#') + 1);
                    } else {
                        views.scrollTo(hash);
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

                    function initView() {
                        if (settings.clientSide) {
                            var options = {
                                async: false,
                                data: route.data || {}
                            };
                            options['data'].params = params;
                            if (route.templateUrl) {
                                options['async'] = true;
                                options['success'] = function (res) {
                                    _processView(url, route, params);
                                };
                                templates.process(route.templateUrl, options);
                            } else {
                                templates.process(route.template, options);
                            }
                        }
                        _processView(url, route, params)
                    }

                    route.validate ?
                        (route.validate.validation() ? initView() : route.validate.onValidationFail())
                        : initView();

                    throw BreakException;
                }
            });
        } catch (e) {
            if (e !== BreakException) throw e;
        }
    }

    function enableClientSideRouting() {
        settings.clientSide = true;
        $(window).bind('hashchange', function (e) {
            process();
            console.log(window.location.hash);
        });
    }

    return {
        enableClientSideRouting: enableClientSideRouting,
        go: go,
        process: process
    }
})();