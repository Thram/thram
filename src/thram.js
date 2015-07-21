/**
 * ThramJS
 *
 * Micro front-end framework
 *
 * Created by thram on 17/06/15.
 */
(function () {
    // DOM Manipulation
    var thram = function (selector) {
        var _DOMApi = {}, _el = undefined;

        function _create(selector) {
            var helper = document.createElement('div');
            helper.innerHTML += selector;
            return helper.firstElementChild;
        }

        function _query(selector, target) {
            target = target || document;
            var elements = target.querySelectorAll(selector);
            return elements.length === 1 ? elements[0] : elements;
        }

        _el = thram.toolbox.isDOMElement(selector) ? selector : (/<[a-z][\s\S]*>/i.test(selector)) ? _create(selector) : _query(selector);

        _DOMApi.element = _el;

        _DOMApi.append = function (html) {
            _el.innerHTML += _DOMApi.isString(html) ? html : html.element.innerHTML;
            return _DOMApi;
        };

        _DOMApi.after = function ($el) {
            _el.parentNode.insertBefore($el.element, _el.nextSibling);
        };
        _DOMApi.before = function ($el) {
            _el.parentNode.insertBefore($el.element, _el);
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
        _DOMApi.find = function (selector) {
            return thram(selector, _el);
        };
        _DOMApi.addClass = function (className) {
            _el.classList.add(className);
            return _DOMApi;
        };

        _DOMApi.removeClass = function (className) {
            _el.classList.remove(className);
            return _DOMApi;
        };
        _DOMApi.toggleClass = function (className) {
            _el.classList.toggle(className);
            return _DOMApi;
        };
        _DOMApi.render = function (id, options) {
            options['container'] = _DOMApi;
            return thram.render.component(id, options);
        };

        return _DOMApi;
    };

    // Core

    var _views = {}, _components = {}, _models = {};
    var _exceptions = {
        'general': {
            code: 'general',
            name: "System Error",
            message: "Error detected. Please contact the system administrator."
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


    thram.create = (function () {

        function view(id, obj) {
            try {
                if (thram.toolbox.isFunction(obj().controller)) {
                    _views[id] = obj;
                    return obj;
                }
            } catch (e) {
                throw _exceptions['view_not_valid'];
            }
            throw _exceptions['view_not_valid'];
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
                throw _exceptions['component_not_valid'];
            }
            throw _exceptions['component_not_valid'];

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
        }
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
        }
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
        }
    })();
    thram.render = (function () {
        function view(id, options) {
            var view = _views[id]();
            options = options || {};
            options['async'] = false;

            function _initView() {
                var base = thram.get.view('base');
                base && base(options['data']);
                thram.views.current = id;
                view.controller(options['data']);
                thram.views.enter();
                options['success'] && options['success'](view);
            }

            if (thram.router.clientSideRouting) {
                // Render the HTML
                if (!thram.templates) throw _exceptions['missing_module'];
                var template = view.template;
                if (!template) {
                    options['async'] = true;
                    options['success'] = function (res) {
                        view.template = res;
                        _initView();
                    };
                    template = view.templateURL;
                }

                thram.templates.process(template, options);
            }
            (!thram.router.clientSideRouting || !options['async']) && _initView();
        }

        function component(id, options) {
            // You need the Template Module to render the modules
            if (!thram.templates) throw _exceptions['missing_module'];

            var component = _components[id];
            options = options || {};
            options['async'] = false;

            function _initComponent() {
                if (component.controller) {
                    component.controller(options['data']);
                }
                thram.events.trigger('component:render:finished');
                options['success'] && options['success'](component);
            }

            var template = component.template;
            if (!template) {
                options['async'] = true;
                options['success'] = function (res) {
                    component.template = res;
                    _initComponent();
                };
                template = component.templateURL;
            }
            if (component.className) options['container'].addClass(component.className);
            thram.templates.process(template, options);
            !options['async'] && _initComponent();
        }

        return {
            view: view,
            component: component
        }
    })();

    window.thram = thram;
    window.$t = window.thram;

})();