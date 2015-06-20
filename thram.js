var thram = (function () {

    function _ready() {
        var fns = [], listener
            , doc = document
            , hack = doc.documentElement.doScroll
            , domContentLoaded = 'DOMContentLoaded'
            , loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)


        if (!loaded)
            doc.addEventListener(domContentLoaded, listener = function () {
                doc.removeEventListener(domContentLoaded, listener)
                loaded = 1;
                while (listener = fns.shift()) listener()
            });

        return function (fn) {
            loaded ? setTimeout(fn, 0) : fns.push(fn)
        }

    }

    var controllers = (function () {
        var _controllers = {};

        function get(key) {
            return _controllers[key];
        }

        function add(key, view) {
            _controllers[key] = view;
        }

        return {
            get: get,
            add: add
        }
    })();

    var views = (function () {
        var _views = {};

        function get(key) {
            return _views[key];
        }

        function add(key, view) {
            _views[key] = view;
        }

        return {
            get: get,
            add: add
        }
    })();

    var components = (function () {
        var _components = {};

        function get(key) {
            return _components[key];
        }

        function add(key, view) {
            _components[key] = view;
        }

        return {
            get: get,
            add: add
        }
    })();

    var modules = (function () {

        var _modules = {};

        function get(key) {
            return _modules[key];
        }

        function add(key, view) {
            _modules[key] = view;
        }

        return {
            get: get,
            add: add
        }
    })();

    var router = (function () {
        function process() {
            thram.routes.forEach(function (route) {
                var routeMatcher = new RegExp(route.route.replace(/:[^\s/]+/g, '([\\w-]+)'));
                var match = window.location.pathname.match(routeMatcher);
                if (match) {
                    var params = {};
                    var url = match.shift();
                    var keys = route.route.match(/:(.+?)(\/|\?|$)/g);
                    if (keys) {
                        keys = keys.join('-').replace(/:/g, '').replace(/\//g, '').split('-');
                        var values = match;
                        keys.forEach(function (key, i) {
                            params[key] = values[i];
                        });
                    }

                    var base = thram.views.get('base');
                    base && base.init(url, params);
                    thram.views.get(route.view).init(url, params);
                }
            });
        }

        return {
            process: process
        }
    })();


    function start() {
        _ready()(function () {
            router.process();
        });
    }

    return {
        routes: [],
        examples: {},
        toolbox: {},
        router: router,
        modules: modules,
        components: components,
        controllers: controllers,
        views: views,
        start: start
    }
})();

thram.examples.view = function () {

    // View Example
    function init(url, params) {
        // Initialize View
    }

    return {
        init: init
    }
};

// Route Example
thram.examples.route = {
    route: '/test/:id',
    view: 'test'
};
