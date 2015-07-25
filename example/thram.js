/**
 * ThramJS
 *
 * Micro front-end framework
 *
 * Created by thram on 17/06/15.
 */
(function () {
    // DOM Manipulation
    var thram = function () {
        var _DOMApi = {}, _el, selector = arguments[0];

        function _create() {
            var helper = document.createElement('div');
            helper.innerHTML += arguments[0];
            return helper.firstElementChild;
        }

        function _query() {
            var target = arguments[1] || document;
            var elements = target.querySelectorAll(arguments[0]);
            return elements.length === 1 ? elements[0] : elements;
        }

        _el = thram.toolbox.isDOMElement(selector) ? selector : (/<[a-z][\s\S]*>/i.test(selector)) ? _create(selector) : _query(selector, arguments[1]);

        _DOMApi.remove = function () {
            if (arguments[0]) {
                if (arguments[1]) {
                    var key = thram.toolbox.toCamelCase(arguments[1].split('-').join(' '));
                    switch (arguments[0]) {
                        case 'data':
                            delete _el.dataset[key];
                            break;
                        case 'prop':
                            delete _el[key];
                            break;
                        case 'attr':
                            _el.removeAttribute(key);
                            break;
                        case 'css':
                            delete _el.style[key];
                            break;
                    }
                    return _DOMApi;
                }
                throw thram.exceptions.missing_argument;
            } else {
                _el.parentElement.removeChild(_el);
            }
        };

        _DOMApi.data = function () {
            if (arguments[0]) {
                var key = thram.toolbox.toCamelCase(arguments[0].split('-').join(' '));
                return arguments[1] ? _el.dataset[key] = arguments[1] : _el.dataset[key];
            }
            throw thram.exceptions.missing_key;
        };

        _DOMApi.prop = function () {
            if (arguments[0]) {
                var key = thram.toolbox.toCamelCase(arguments[0].split('-').join(' '));
                return arguments[1] ? _el[key] = arguments[1] : _el[key];
            }
            throw thram.exceptions.missing_key;
        };
        _DOMApi.attr = function () {
            if (arguments[0]) {
                return arguments[1] ? _el.setAttribute(arguments[0], arguments[1]) : _el.getAttribute(arguments[0]);
            }
            throw thram.exceptions.missing_key;
        };
        _DOMApi.css = function () {
            if (arguments[0]) {
                var key = thram.toolbox.toCamelCase(arguments[0].split('-').join(' '));
                return arguments[1] ? _el.style[key] = arguments[1] : _el.style[key];
            }
            throw thram.exceptions.missing_key;
        };

        _DOMApi.append = function () {
            if (arguments[0])
                _el.innerHTML += thram.toolbox.isString(arguments[0]) ? arguments[0] : arguments[0].element.innerHTML;
            return _DOMApi;
        };

        _DOMApi.size = function () {
            return _el.length;
        };
        _DOMApi.html = function () {
            return arguments[0] ? (_el.innerHTML = thram.toolbox.isString(arguments[0]) ? arguments[0] : arguments[0].element.innerHTML) : _el.innerHTML;
        };

        _DOMApi.after = function () {
            _el.parentNode.insertBefore(arguments[0].element, _el.nextSibling);
        };
        _DOMApi.before = function () {
            _el.parentNode.insertBefore(arguments[0].element, _el);
        };

        _DOMApi.isEmpty = function () {
            return _el.hasChildNodes();
        };
        _DOMApi.next = function () {
            return thram(_el.nextSibling);
        };
        _DOMApi.previous = function () {
            return thram(_el.previousSibling);
        };
        _DOMApi.parent = function () {
            return thram(_el.parentNode);
        };
        _DOMApi.empty = function () {
            while (_el.firstChild) _el.removeChild(_el.firstChild);
            return _DOMApi;
        };
        _DOMApi.clone = function () {
            return thram(_el.cloneNode(true));
        };
        _DOMApi.find = function () {
            return thram(arguments[0], _el);
        };
        _DOMApi.addClass = function () {
            _el.classList.add(arguments[0]);
            return _DOMApi;
        };

        _DOMApi.removeClass = function () {
            _el.classList.remove(arguments[0]);
            return _DOMApi;
        };
        _DOMApi.toggleClass = function () {
            _el.classList.toggle(arguments[0]);
            return _DOMApi;
        };
        _DOMApi.each = function () {
            var callback = arguments[0];
            if (thram.toolbox.isNodeList(_el)) {
                thram.toolbox.iterate(_el, function () {
                    callback = callback.bind($t(this));
                    callback($t(this));
                });
            }
        };
        _DOMApi.render = function () {
            if (arguments) {
                var options = arguments[1] || {};
                options.container = _DOMApi;
                return thram.render.component(arguments[0], arguments[1]);
            }

        };
        _DOMApi.load = function () {
            var options = arguments[0] || {};
            var success = options.success;
            options.type = 'html';
            options.success = function (res) {
                var html = $t(res);
                _DOMApi.append(html);
                success && success(html);
            };
            thram.ajax.get(options);
        };

        _DOMApi.element = _el;
        return _DOMApi;
    };

    // Core

    /**
     * DOM Ready
     *
     * Based on domready by Dustin Diaz: https://github.com/ded/domready
     *
     * @returns {Function}
     * @private
     */
    function _ready() {
        var fns = [], listener, doc = document, hack = doc.documentElement.doScroll, domContentLoaded = 'DOMContentLoaded', loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState);
        if (!loaded)
            doc.addEventListener(domContentLoaded, listener = function () {
                doc.removeEventListener(domContentLoaded, listener);
                loaded = 1;
                while (listener = fns.shift()) listener();
            });
        return function (fn) {
            loaded ? setTimeout(fn, 0) : fns.push(fn);
        };
    }

    var _views = {}, _components = {}, _models = {};

    thram.create = (function () {

        function view(id, obj) {
            try {
                if (thram.toolbox.isFunction(obj().controller)) {
                    _views[id] = obj;
                    return obj;
                }
            } catch (e) {
                throw thram.exceptions.view_not_valid;
            }
            throw thram.exceptions.view_not_valid;
        }

        function model(id, obj) {
            _models[id] = obj;
            return obj;
        }

        function component(id, obj) {
            try {
                var componentObj = obj();
                if (componentObj.template || (!componentObj.template && componentObj.templateURL)) {
                    _components[id] = obj;
                    return obj;
                }
            } catch (e) {
                throw thram.exceptions.component_not_valid;
            }
            throw thram.exceptions.component_not_valid;

        }

        function tool(id, obj) {
            thram.toolbox[id] = obj();
            return obj;
        }

        return {
            view: view,
            model: model,
            component: component,
            tool: tool
        };
    })();

    thram.get = (function () {
        function view(id) {
            return _views[id];
        }

        function model(id) {
            return _models[id];
        }

        function component(id) {
            return _components[id];
        }

        function tool(id) {
            return thram.toolbox[id];
        }

        return {
            view: view,
            model: model,
            component: component,
            tool: tool
        };
    })();

    thram.remove = (function () {
        function view(id) {
            delete _views[id];
        }

        function model(id) {
            delete _models[id];
        }

        function component(id) {
            delete _components[id];
        }

        function tool(id) {
            delete thram.toolbox[id];
        }

        return {
            view: view,
            model: model,
            component: component,
            tool: tool
        };
    })();
    thram.render = (function () {
        function view(id, options) {
            var v = _views[id]();
            options = options || {};
            options.async = false;
            var success = options.success;

            function _initView() {
                var base = thram.get.view('base');
                base && base(options.data);
                thram.views.current = id;
                v.controller(options.data);
                thram.views.enter();
                success && success(v);
            }

            if (thram.router.clientSideRouting) {
                // Render the HTML
                if (!thram.templates) throw thram.exceptions.missing_module;
                var template = v.template;
                if (!template) {
                    options.async = true;
                    options.success = function (res) {
                        v.template = res;
                        _initView();
                    };
                    template = v.templateURL;
                }

                thram.templates.process(template, options);
            }
            (!thram.router.clientSideRouting || !options.async) && _initView();
        }

        function component(options) {
            // You need the Template Module to render the modules
            if (!thram.templates) throw thram.exceptions.missing_module;

            options = options || {};
            var id = options.container.data('thram-component');
            var c = _components[id]();
            options.async = false;
            var success = options.success;

            function _initComponent() {
                if (c.controller) {
                    c.controller(options.data);
                }
                thram.event.trigger('component:render:finished');
                success && success(c);
            }

            var template = c.template;
            if (!template) {
                options.async = true;
                options.success = function (res) {
                    c.template = res;
                    _initComponent();
                };
                template = c.templateURL;
            }
            if (c.className) options.container.addClass(c.className);
            thram.templates.process(template, options);
            !options.async && _initComponent();
        }

        return {
            view: view,
            component: component
        };
    })();


    thram.start = (function () {
        _ready()(function () {
            thram.views.enter();
            thram.router.process();
            if (thram.router.clientSideRouting) {
                window.addEventListener("hashchange", function (e) {
                    thram.views.leave(thram.views.current);
                    thram.router.process();
                }, false);
            }
        });
    });
    window.thram = thram;
    window.$t = window.thram;

})();
/**
 * Created by thram on 23/07/15.
 */
thram.ajax = (function () {
    var _AjaxApi = {
        cors: false
    };

    function _new() {
        var XMLHTTP_IDS, xmlhttp, success = false, i;
        try {
            // Mozilla/Chrome/Safari/IE7+ (normal browsers)
            xmlhttp = new XMLHttpRequest();
            // For cross-origin requests, some simple logic to determine if XDomainReqeust is needed.
            if (thram.toolbox.isUndefined(xmlhttp.withCredentials)) {
                xmlhttp = new XDomainRequest();
            }
        } catch (e1) {
            // Internet Explorer
            XMLHTTP_IDS = ['MSXML2.XMLHTTP.5.0', 'MSXML2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'];
            for (i = 0; i < XMLHTTP_IDS.length && !success; i++) {
                try {
                    success = true;
                    xmlhttp = new ActiveXObject(XMLHTTP_IDS[i]);
                } catch (e2) {
                }
            }
            if (!success) {
                throw new Error('Unable to create XMLHttpRequest!');
            }
        }

        return xmlhttp;
    }

    function _jsonp() {
        // TODO Implement jsonp

        //window.myJsonpCallback = function(data) {
        //    // handle requested data from server
        //};
        //var scriptEl = document.createElement('script');
        //scriptEl.setAttribute('src', 'http://jsonp-aware-endpoint.com/user?callback=myJsonpCallback&id=123');
        //document.body.appendChild(scriptEl);
    }

    function _ajax() {
        if (arguments) {
            var options = arguments[0] || {};
            var request = _new();
            try {
                options.headers = options.headers || {};
                if (!options.headers['Content-Type']) {
                    options.type = options.type || 'html';
                    var contentType;
                    switch (options.type) {
                        case 'txt':
                            contentType = 'text/plain';
                            break;
                        case 'jsonp':
                            _jsonp(options);
                            return;
                        case 'json':
                            contentType = 'application/json';
                            var success = options.success;
                            options.success = function (res) {
                                success && success(JSON.parse(res));
                            };
                            break;
                        case 'html':
                            contentType = 'text/html';
                            break;
                        default:
                            contentType = 'application/x-www-form-urlencoded';

                    }
                    options.headers['Content-Type'] = contentType + '; charset=UTF-8';
                }

                request.withCredentials = options.cors || _AjaxApi.cors;
                request.open(options.method, encodeURI(options.url), true);
                for (var header in options.headers) {
                    options.headers.hasOwnProperty(header) && request.setRequestHeader(header, options.headers[header]);
                }
                request.onload = function () {
                    if (request.status === 200) {
                        options.success && options.success(request.responseText);
                    } else {
                        throw {error: request.status, message: request.statusText};
                    }
                };
                request.onreadystatechange = function () { // set request handler
                    var level;
                    if (request.readyState === 4) { // if state = 4 (operation is completed)
                        if (request.status === 200) { // and the HTTP status is OK
                            // get progress from the XML node and set progress bar width and innerHTML
                            level = request.responseXML ? request.responseXML.getElementsByTagName('PROGRESS')[0].firstChild.nodeValue : 100;
                            options.progress && options.progress(level);
                        } else { // if request status is not OK
                            throw {error: request.status, message: request.statusText};
                        }
                    }
                };
                var data = options.data || {};
                request.send(data instanceof FormData ? data : JSON.stringify(data));
            } catch (error) {
                options.error && options.error(error);
            }

        }

    }

    function _processOptions() {
        var options = arguments[0] || {};
        options.success = options.success || console.log;
        options.error = options.error || console.error;
        return options;
    }

    _AjaxApi.get = function () {
        var options = _processOptions(arguments[0]);
        options.method = 'GET';
        _ajax(options);
    };
    _AjaxApi.post = function () {
        var options = _processOptions(arguments[0]);
        options.method = 'GET';
        _ajax(options);
    };

    _AjaxApi.post = function () {
        var options = _processOptions(arguments[0]);
        options.method = 'POST';
        _ajax(options);
    };
    _AjaxApi.put = function () {
        var options = _processOptions(arguments[0]);
        options.method = 'PUT';
        _ajax(options);

    };
    _AjaxApi.patch = function () {
        var options = _processOptions(arguments[0]);
        options.method = 'PATCH';
        _ajax(options);
    };
    _AjaxApi.delete = function () {
        var options = _processOptions(arguments[0]);
        options.method = 'DELETE';
        _ajax(options);
    };
    _AjaxApi.form = function () {
        var options = _processOptions(arguments[0]);
        var formData = new FormData();
        for (var key in options.data) {
            options.data.hasOwnProperty(key) && formData.append(key, options.data[key]);
        }
        options.method = 'POST';
        options.data = formData;
        _ajax(options);
    };

    return _AjaxApi;
})();
/**
 * Created by thram on 26/07/15.
 */
thram.animation = (function () {
    var _AnimationApi = {};

    return _AnimationApi;
})();
/**
 * Created by thram on 20/07/15.
 */
thram.event = (function () {
    var _EventApi = {};
    _EventApi.trigger = function (event, data) {
        var ev = new Event('thram:' + event, data);
        dispatchEvent(ev);
    };
    _EventApi.on = function (event, func, reset) {
        if (reset) {
            removeEventListener("thram:" + event, func);
        }
        addEventListener("thram:" + event, func);
    };
    _EventApi.off = function (event, func) {
        removeEventListener("thram:" + event, func);
    };

    return _EventApi;
})();
/**
 * Created by thram on 20/07/15.
 */
thram.examples = {
    view: function () {
        // Create
        thram.create.view('test', function () {
            return {
                template: '<div>Example</div>',
                templateURL: 'views/test.html',
                controller: function (options) {
                }
            };
        });

        // Get
        var testView = thram.get.view('test');
        testView.render();
        // Remove
        thram.remove.view('test');
    },
    component: function () {
        // Create
        thram.create.component('test', function () {
            return {
                template: '<div>Example</div>',
                templateURL: 'component/test.html',
                //Optional
                className: '',
                controller: function (options) {
                }
            };
        });

        // Get
        var testComponent = thram.get.component('test');
        testComponent.render();
        // Remove
        thram.remove.component('test');
    },
    model: function () {
        // Create
        thram.create.model('test', function (params) {
            var _obj = params || {};

            function get(id) {
                return _obj[id];
            }

            function set(id, val) {
                _obj[id] = val;
            }

            return {get: get, set: set};
        });

        // Get
        var testModel = thram.get.model('test')({'joker': 'Hahahahaha!'});
        testModel.set('deadpool', 'Coolest Superhero ever!');
        testModel.get('deadpool');
        testModel.get('joker');
        // Remove
        thram.remove.model('test');
    },
    toolbox: function () {
        // Create
        thram.create.tool('test', function () {
            function log(message) {
                console.log(message);
            }

            function error(message) {
                console.log(message);
            }

            return {
                log: log,
                error: error
            };
        });

        // Get
        var testTool = thram.get.tool('test');
        testTool.log('Message!');
        thram.toolbox.test.log('Message!');
        // Remove
        thram.remove.tool('test');
    },
    events: function () {
        // Create
        thram.event.on('test', function (ev) {
            console.log(ev);
        });
        thram.event.off('test');
        thram.event.trigger('test');
    },
    router: function () {
        thram.routes = [
            {route: '/', view: 'index'},
            {route: '/:app_namespace', view: 'details'}
        ];
    },
    storage: function () {
    },
    templates: function () {
    }
};
/**
 * Created by thram on 23/07/15.
 */
thram.exceptions = {
    'general': {
        code: 'general',
        name: "System Error",
        message: "Error detected. Please contact the system administrator."
    },
    'missing_id': {
        code: 'missing-id',
        name: "Missing id",
        message: "You need at least the ID."
    },
    'missing_argument': {
        code: 'missing-argument',
        name: "Missing argument",
        message: "This method needs arguments, please check the documentation."
    },
    'wrong_type_arguments': {
        code: 'wrong-type-arguments',
        name: "Wrong type arguments",
        message: "The arguments don't math with any valid combination,  please check the documentation."
    },
    'missing_key': {
        code: 'missing-key',
        name: "Missing key",
        message: "You need at least the key."
    },
    'missing_module': {
        code: 'missing-module',
        name: "Module not found",
        message: "There is a module dependency. Please check if you added the correct modules."
    },
    'view_not_valid': {
        code: 'view-not-valid',
        name: "View format not valid",
        message: "The View Object must have a 'controller' method."
    },
    'component_not_valid': {
        code: 'component-not-valid',
        name: "Component format not valid",
        message: "The Component Object must have a 'template' or 'templateURL' attached."
    },
    'no_view': {
        code: 'no-view',
        name: "No View attached",
        message: "There is no View attached to the route. Please add one. Ex.: thram.router.register('/', {view: 'viewId' }"
    }
};
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
/**
 * Created by thram on 20/07/15.
 */
thram.storage = (function () {
    // Store.js
    var store = {},
        win = window,
        doc = win.document,
        localStorageName = 'localStorage',
        scriptTag = 'script',
        storage;

    store.disabled = false;
    store.version = '1.3.17';
    store.set = function (key, value) {
    };
    store.get = function (key, defaultVal) {
    };
    store.has = function (key) {
        return store.get(key) !== undefined;
    };
    store.remove = function (key) {
    };
    store.clear = function () {
    };
    store.transact = function (key, defaultVal, transactionFn) {
        if (transactionFn === null) {
            transactionFn = defaultVal;
            defaultVal = null;
        }
        if (defaultVal === null) {
            defaultVal = {};
        }
        var val = store.get(key, defaultVal);
        transactionFn(val);
        store.set(key, val);
    };
    store.getAll = function () {
    };
    store.forEach = function () {
    };

    store.serialize = function (value) {
        return JSON.stringify(value);
    };
    store.deserialize = function (value) {
        if (typeof value != 'string') {
            return undefined;
        }
        try {
            return JSON.parse(value);
        }
        catch (e) {
            return value || undefined;
        }
    };

    // Functions to encapsulate questionable FireFox 3.6.13 behavior
    // when about.config::dom.storage.enabled === false
    // See https://github.com/marcuswestin/store.js/issues#issue/13
    function isLocalStorageNameSupported() {
        try {
            return (localStorageName in win && win[localStorageName]);
        }
        catch (err) {
            return false;
        }
    }

    if (isLocalStorageNameSupported()) {
        storage = win[localStorageName];
        store.set = function (key, val) {
            if (val === undefined) {
                return store.remove(key);
            }
            storage.setItem(key, store.serialize(val));
            return val;
        };
        store.get = function (key, defaultVal) {
            var val = store.deserialize(storage.getItem(key));
            return (val === undefined ? defaultVal : val);
        };
        store.remove = function (key) {
            storage.removeItem(key);
        };
        store.clear = function () {
            storage.clear();
        };
        store.getAll = function () {
            var ret = {};
            store.forEach(function (key, val) {
                ret[key] = val;
            });
            return ret;
        };
        store.forEach = function (callback) {
            for (var i = 0; i < storage.length; i++) {
                var key = storage.key(i);
                callback(key, store.get(key));
            }
        };
    } else if (doc.documentElement.addBehavior) {
        var storageOwner,
            storageContainer;
        // Since #userData storage applies only to specific paths, we need to
        // somehow link our data to a specific path.  We choose /favicon.ico
        // as a pretty safe option, since all browsers already make a request to
        // this URL anyway and being a 404 will not hurt us here.  We wrap an
        // iframe pointing to the favicon in an ActiveXObject(htmlfile) object
        // (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
        // since the iframe access rules appear to allow direct access and
        // manipulation of the document element, even for a 404 page.  This
        // document can be used instead of the current document (which would
        // have been limited to the current path) to perform #userData storage.
        try {
            storageContainer = new ActiveXObject('htmlfile');
            storageContainer.open();
            storageContainer.write('<' + scriptTag + '>document.w=window</' + scriptTag + '><iframe src="/favicon.ico"></iframe>');
            storageContainer.close();
            storageOwner = storageContainer.w.frames[0].document;
            storage = storageOwner.createElement('div');
        } catch (e) {
            // somehow ActiveXObject instantiation failed (perhaps some special
            // security settings or otherwse), fall back to per-path storage
            storage = doc.createElement('div');
            storageOwner = doc.body;
        }
        var withIEStorage = function (storeFunction) {
            return function () {
                var args = Array.prototype.slice.call(arguments, 0);
                args.unshift(storage);
                // See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
                // and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
                storageOwner.appendChild(storage);
                storage.addBehavior('#default#userData');
                storage.load(localStorageName);
                var result = storeFunction.apply(store, args);
                storageOwner.removeChild(storage);
                return result;
            };
        };

        // In IE7, keys cannot start with a digit or contain certain chars.
        // See https://github.com/marcuswestin/store.js/issues/40
        // See https://github.com/marcuswestin/store.js/issues/83
        var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");
        var ieKeyFix = function (key) {
            return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___');
        };
        store.set = withIEStorage(function (storage, key, val) {
            key = ieKeyFix(key);
            if (val === undefined) {
                return store.remove(key);
            }
            storage.setAttribute(key, store.serialize(val));
            storage.save(localStorageName);
            return val;
        });
        store.get = withIEStorage(function (storage, key, defaultVal) {
            key = ieKeyFix(key);
            var val = store.deserialize(storage.getAttribute(key));
            return (val === undefined ? defaultVal : val);
        });
        store.remove = withIEStorage(function (storage, key) {
            key = ieKeyFix(key);
            storage.removeAttribute(key);
            storage.save(localStorageName);
        });
        store.clear = withIEStorage(function (storage) {
            var attributes = storage.XMLDocument.documentElement.attributes;
            storage.load(localStorageName);
            while (attributes.length) {
                storage.removeAttribute(attributes[0].name);
            }
            storage.save(localStorageName);
        });
        store.getAll = function (storage) {
            var ret = {};
            store.forEach(function (key, val) {
                ret[key] = val;
            });
            return ret;
        };
        store.forEach = withIEStorage(function (storage, callback) {
            var attributes = storage.XMLDocument.documentElement.attributes;
            for (var i = 0, attr; attr = attributes[i]; ++i) {
                callback(attr.name, store.deserialize(storage.getAttribute(attr.name)));
            }
        });
    }

    try {
        var testKey = '__storejs__';
        store.set(testKey, testKey);
        if (store.get(testKey) != testKey) {
            store.disabled = true;
        }
        store.remove(testKey);
    } catch (e) {
        store.disabled = true;
    }
    store.enabled = !store.disabled;

    return store;
})();
/**
 * Created by thram on 20/07/15.
 */
thram.templates = (function () {

    var _pool = {};

    function _getData(element) {
        var thramData = element.data('thram-data');
        return thram.toolbox.isString(thramData) ? eval("(" + thramData + ")") : thramData;
    }

    //function process(id, data) {
    //  var html = document.querySelector('script#' + id + '[type=template]').innerHTML;
    function _loader(templateUrl, container, success, error) {
        _pool[templateUrl] = _pool[templateUrl] || {status: 'pending', queue: []};
        var html = thram.storage.get('template:' + templateUrl);
        if (html)   _pool[templateUrl].status = 'loaded';
        switch (_pool[templateUrl].status) {
            case 'pending':
                _pool[templateUrl].status = 'loading';
                return $t("<div>").load({
                    url: templateUrl,
                    success: function (res) {
                        _pool[templateUrl].status = 'loaded';
                        thram.storage.set('template:' + templateUrl, res.html());
                        var done = 0;
                        _pool[templateUrl].queue.forEach(function (template) {
                            template.success && template.success(res.html(), template.container);
                            done++;
                            if (done === _pool[templateUrl].queue.length) {
                                _pool[templateUrl].queue = [];
                            }
                        });

                        return success && success(res.html(), container);
                    },
                    error: error
                });
            case 'loading':
                _pool[templateUrl].queue.push({success: success, error: error, container: container});
                break;
            case 'loaded':
                return success && success(html, container);
        }


    }

    function _processMarkup(template, data) {
        // Based on the article by Krasimir: http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line;
        if (template) {
            data = data || {};
            var re = /\{\{(.+?)}}/g,
                reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g,
                code = 'with(obj) { var r=[];\n',
                cursor = 0,
                result, match;
            var add = function (line, js) {
                js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                    (code += line !== '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
                return add;
            };
            while (match = re.exec(template)) {
                add(template.slice(cursor, match.index))(match[1], true);
                cursor = match.index + match[0].length;
            }
            add(template.substr(cursor, template.length - cursor));
            code = (code + 'return r.join(""); }').replace(/[\r\t\n]/g, '');
            try {
                result = new Function('obj', code).apply(data, [data]);
            }
            catch (err) {
                console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n");
            }
            return result;
        } else {
            throw {error: 'Template undefined'};
        }

    }

    function process(template, options) {
        try {
            if (options.async) {
                var container = options.container || $t('[data-thram-view]');
                container.data('thram-data', JSON.stringify(options.data || _getData(container)));
                _loader(template, container, function (res, $el) {
                    var data = _getData($el);
                    var html = _processMarkup(res, data);
                    $el.remove('data', 'thram-data');
                    $el.html(html);
                    var components = $el.find('[data-thram-component]');
                    components.each(function (component) {
                        thram.render.component({container: component, data: _getData(component)});
                    });
                    options.success && options.success(res, $el);
                });
            } else {
                _processMarkup(template, options.data);
            }
        } catch (e) {
            console.error(e);
            options.error && options.error(e);
        }

    }

    return {
        process: process
    };
})();
/**
 * Created by thram on 20/07/15.
 */
thram.toolbox = (function () {
    var _ToolBoxApi = {};

    _ToolBoxApi.toType = (function (global) {
        var toString = Object.prototype.toString;
        var re = /^.*\s(\w+).*$/;
        return function (obj) {
            if (obj === global) {
                return "global";
            }
            return toString.call(obj).replace(re, '$1').toLowerCase();
        };
    })(this);

    _ToolBoxApi.isDOMElement = function (obj) {
        return obj && !!obj.tagName;
    };
    _ToolBoxApi.isType = function (obj, type) {
        return _ToolBoxApi.toType(obj) === type;
    };

    _ToolBoxApi.isUndefined = function (obj) {
        return _ToolBoxApi.isType(obj, 'undefined');
    };

    _ToolBoxApi.isNull = function (obj) {
        return obj === null;
    };

    _ToolBoxApi.isNan = function (obj) {
        return isNaN(obj);
    };
    _ToolBoxApi.isBoolean = function (obj) {
        return _ToolBoxApi.isType(obj, 'boolean');
    };
    _ToolBoxApi.isNumber = function (obj) {
        return _ToolBoxApi.isType(obj, 'number');
    };

    _ToolBoxApi.isString = function (obj) {
        return _ToolBoxApi.isType(obj, 'string');
    };

    _ToolBoxApi.isObject = function (obj) {
        return !_ToolBoxApi.isNull(obj) && _ToolBoxApi.isType(obj, 'object');
    };

    _ToolBoxApi.isFunction = function (obj) {
        return _ToolBoxApi.isType(obj, 'function');
    };
    _ToolBoxApi.isArray = function (obj) {
        return _ToolBoxApi.isType(obj, 'array');
    };

    _ToolBoxApi.isNodeList = function (obj) {
        return _ToolBoxApi.isType(obj, 'nodelist');
    };

    function _resolve() {
        var _callback = arguments[0], _el = arguments[1];
        if (_callback) {
            _callback = _callback.bind(_el);
            _callback(_el);
        }
    }

    _ToolBoxApi.iterate = function () {
        var collection = arguments[0], callback = arguments[1];
        if (_ToolBoxApi.isArray(collection) || _ToolBoxApi.isNodeList(collection)) {
            for (var i = 0, len = collection.length; i < len; i++) {
                _resolve(callback, collection[i]);
            }
        } else {
            throw thram.exceptions.wrong_type_arguments;
        }
    };

    _ToolBoxApi.each = function () {
        var collection = arguments[0], callback = arguments[1];
        if (_ToolBoxApi.isObject(collection)) {
            for (var element in collection) {
                if (collection.hasOwnProperty(element)) {
                    _resolve(callback, element);
                }
            }
        } else {
            throw thram.exceptions.wrong_type_arguments;
        }
    };

    _ToolBoxApi.clone = function (obj) {
        if (null === obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    };
    // convert any string to camelCase
    _ToolBoxApi.toCamelCase = function (str) {
        return str.toLowerCase()
            .replace(/['"]/g, '')
            .replace(/\W+/g, ' ')
            .replace(/ (.)/g, function ($1) {
                return $1.toUpperCase();
            })
            .replace(/ /g, '');
    };

    return _ToolBoxApi;
})();
/**
 * Created by thram on 23/07/15.
 */
thram.url = (function () {
    var _URLApi = {};

    _URLApi.encodeParams = function (object) {
        var encodedString = '';
        for (var prop in object) {
            if (object.hasOwnProperty(prop)) {
                if (encodedString.length > 0) {
                    encodedString += '&';
                }
                encodedString += encodeURI(prop + '=' + object[prop]);
            }
        }
        return encodedString;
    };
    return _URLApi;
})();
/**
 * Created by thram on 20/07/15.
 */
thram.views = (function () {
    var _ViewsApi = {};
    _ViewsApi.enter = function (event, data) {
    };
    _ViewsApi.leave = function (event, func, reset) {
    };
    _ViewsApi.scrollTo = function (selector, callback) {
        //    var target = $t(selector);
        //    // Smooth Scrolling
        //    if (target.length) {
        //        $t('html,body').animate({
        //            scrollTop: target.offset().top
        //        }, 500, callback);
        //    }
    };

    window.onbeforeunload = _ViewsApi.leave;

    return _ViewsApi;
})();