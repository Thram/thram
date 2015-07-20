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

        _el = (/<[a-z][\s\S]*>/i.test(selector)) ? _create(selector) : _query(selector);

        _DOMApi.element = _el;

        _DOMApi.append = function (html) {
            _el.innerHTML += _DOMApi.isString(html) ? html : html.element.innerHTML;
        };

        _DOMApi.find = function (selector) {
            return _query(selector, _el);
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
        'view_not_valid': {
            code: 'view-not-valid',
            name: "View format not valid",
            message: "The View Object must have a 'controller' method."
        },
        'component_not_valid': {
            code: 'component-not-valid',
            name: "Component format not valid",
            message: "The Component Object must have a 'render' method."
        }
    };


    thram.create = (function () {

        function view(id, obj) {
            try {
                var viewObj = obj();
                if (thram.toolbox.isFunction(viewObj.controller)) {
                    _views[id] = viewObj;
                    return viewObj;
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
                if (thram.toolbox.isFunction(obj().render)) {
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

    window.thram = thram;
    window.$t = window.thram;

})();