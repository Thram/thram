/** tetas
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

        _el = thram.toolbox.isDOMElement(selector) ? selector : (/<[a-z][\s\S]*>/i.test(selector)) ? _create(selector) : _query(selector);

        _DOMApi.element = _el;
        _DOMApi.data = function () {
            if (arguments) {
                var key = thram.toolbox.toCamelCase(arguments[0].split('-').join(' '));
                return arguments.length == 1 ? _el.dataset[key] : _el.dataset[key] = arguments[1];
            }
            throw thram.exceptions.missing_key
        };
        _DOMApi.prop = function () {
            if (arguments) {
                var key = thram.toolbox.toCamelCase(arguments[0].split('-').join(' '));
                return arguments.length == 1 ? _el[key] : _el[key] = arguments[1];
            }
            throw thram.exceptions.missing_key
        };
        _DOMApi.attr = function () {
            if (arguments) {
                return arguments.length == 1 ? _el.getAttribute(arguments[0]) : _el.setAttribute(arguments[0], arguments[1]);
            }
            throw thram.exceptions.missing_key
        };
        _DOMApi.css = function () {
            if (arguments) {
                var key = thram.toolbox.toCamelCase(arguments[0].split('-').join(' '));
                return arguments.length == 1 ? _el.style[key] : _el.style[key] = arguments[1];
            }
            throw thram.exceptions.missing_key
        };

        _DOMApi.append = function () {
            _el.innerHTML += thram.toolbox.isString(arguments[0]) ? arguments[0] : arguments[0].element.innerHTML;
            return _DOMApi;
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
        _DOMApi.render = function () {
            if (arguments) {
                var options = arguments[1] || {};
                options.container = _DOMApi;
                return thram.render.component(arguments[0], arguments[1]);
            }

        };

        return _DOMApi;
    };


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

    // Core

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

            function _initView() {
                var base = thram.get.view('base');
                base && base(options.data);
                thram.views.current = id;
                v.controller(options.data);
                thram.views.enter();
                options.success && options.success(v);
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

        function component(id, options) {
            // You need the Template Module to render the modules
            if (!thram.templates) throw thram.exceptions.missing_module;

            var c = _components[id];
            options = options || {};
            options.async = false;

            function _initComponent() {
                if (c.controller) {
                    c.controller(options.data);
                }
                thram.events.trigger('component:render:finished');
                options.success && options.success(c);
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
        });
    });
    window.thram = thram;
    window.$t = window.thram;

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
                if (thram.templates && window.location.hash !== '') {
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

    //function process(id, data) {
    //  var html = document.querySelector('script#' + id + '[type=template]').innerHTML;
    function _loader(templateUrl, container, success, error) {
        _pool[templateUrl] = _pool[templateUrl] || {status: 'pending', queue: []};
        switch (_pool[templateUrl].status) {
            case 'pending':
                _pool[templateUrl].status = 'loading';
                return $t("<div>").load(templateUrl, function (res) {
                    _pool[templateUrl].status = 'loaded';
                    thram.storage.set('template:' + templateUrl, res);
                    var done = 0;
                    _pool[templateUrl].queue.forEach(function (template) {
                        template.success && template.success(res, template.container);
                        done++;
                        if (done === _pool[templateUrl].queue.length) {
                            _pool[templateUrl].queue = [];
                        }
                    });

                    return success && success(res, container);
                }, error);
            case 'loading':
                _pool[templateUrl].queue.push({success: success, error: error, container: container});
                break;
            case 'loaded':
                var html = thram.storage.get('template:' + templateUrl);
                if (html) {
                    _pool[templateUrl].status = 'loaded';
                    return success && success(html, container);
                }
                break;
        }


    }

    function _processMarkup(template, data) {
        console.log('process markup!');
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
                var thramData = container.data('thram-data');
                var _data = thram.toolbox.isString(thramData) ? eval("(" + thramData + ")") : thramData;
                container.data('thram-data', options.data || _data);
                _loader(template, container, function (res, el) {
                    var data = el.data('thram-data');
                    var html = _processMarkup(res, data);
                    el.removeData('thram-data');
                    el.html(html);
                    var components = el.find('[data-thram-component]');
                    if (components.size() > 0) {
                        components.each(function () {
                            thram.components.render($t(this));
                        });
                    }
                    options.success && options.success(res, el);
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
        return $t.isType(obj, 'undefined');
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
 * Created by thram on 20/07/15.
 */
thram.views = (function () {
    var _ViewsApi = {};
    _ViewsApi.enter = function (event, data) {
    };
    _ViewsApi.leave = function (event, func, reset) {
    };
    //_ViewsApi.scrollTo = function (selector, callback) {
    //    var target = $t(selector);
    //    // Smooth Scrolling
    //    if (target.length) {
    //        $t('html,body').animate({
    //            scrollTop: target.offset().top
    //        }, 500, callback);
    //    }
    //};

    window.onbeforeunload = _ViewsApi.leave;

    return _ViewsApi;
})();