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