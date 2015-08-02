/**
 * ThramJS
 *
 * Micro front-end framework
 *
 * Created by thram on 17/06/15.
 *
 * Core Libs:
 *
 * thram.exceptions
 * thram.toolbox
 * thram.dom
 * * thram.ajax
 * (Optional) thram.storage // Enables local storage
 * (Optional) thram.templates // Enables partial rendering and client-side routing
 * thram.router
 * thram.event
 * (Optional) thram.animations // Enables animations and transitions
 * (Optional) thram.transitions // Enables page transitions
 *
 */
(function () {
    // Core
    var thram       = {},
        _views      = {},
        _components = {},
        _models     = {};

    thram.create = (function () {
        var _CreateApi = {};

        _CreateApi.view = function (id, obj) {
            try {
                if (thram.toolbox.isFunction(obj().controller)) {
                    _views[id] = obj;
                    return obj;
                }
            } catch (e) {
                throw thram.exceptions.view_not_valid;
            }
            throw thram.exceptions.view_not_valid;
        };

        _CreateApi.model = function (id, obj) {
            _models[id] = obj;
            return obj;
        };

        _CreateApi.component = function (id, obj) {
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

        };

        _CreateApi.tool = function (id, obj) {
            thram.toolbox[id] = obj();
            return obj;
        };

        return _CreateApi;
    })();

    thram.get = (function () {
        var _GetApi = {};

        _GetApi.view = function (id) {
            return _views[id];
        };

        _GetApi.model = function (id) {
            return _models[id];
        };

        _GetApi.component = function (id) {
            return _components[id];
        };

        _GetApi.tool = function (id) {
            return thram.toolbox[id];
        };

        return _GetApi;
    })();

    thram.remove = (function () {
        var _RemoveApi  = {};
        _RemoveApi.view = function (id) {
            delete _views[id];
        };

        _RemoveApi.model = function (id) {
            delete _models[id];
        };

        _RemoveApi.component = function (id) {
            delete _components[id];
        };

        _RemoveApi.tool = function (id) {
            delete thram.toolbox[id];
        };

        return _RemoveApi;
    })();

    thram.render = (function () {
        var _RenderApi = {};

        function _getScriptTemplate(url) {
            var filename = thram.toolbox.getFileName(url);
            var a        = filename.split('.');
            a.pop();
            var template = $t('script#' + a);
            return template ? template.html() : undefined;
        }

        _RenderApi.view = function (id, options) {
            var v         = _views[id]();
            options       = options || {};
            options.async = false;
            var success   = options.success;

            function _initView() {
                var base       = thram.get.view('base');
                base && base(options.data);
                _views.current = id;
                v.controller(options.data);
                thram.event.trigger('view:enter', {id: id});
                success && success(v);
                thram.event.trigger('view:render:finished', {id: id});
            }

            if (thram.router.clientSideRouting) {
                // Render the HTML
                if (!thram.templates) throw thram.exceptions.missing_module;
                var template = v.template;
                if (!template) {
                    template = _getScriptTemplate(v.templateURL);
                    if (!template) {
                        options.async   = true;
                        options.success = function (res) {
                            v.template = res;
                            _initView();
                        };
                        template        = v.templateURL;
                    }
                }

                thram.templates.process(template, options);
            }
            (!thram.router.clientSideRouting || !options.async) && _initView();
        };

        _RenderApi.component = function (options) {
            // You need the Template Module to render the modules
            if (!thram.templates) throw thram.exceptions.missing_module;

            options       = options || {};
            var id        = options.container.data('thram-component');
            var c         = _components[id]();
            options.async = false;
            var success   = options.success;

            function _initComponent() {
                if (c.controller) {
                    c.controller(options.data);
                }
                success && success(c);
                thram.event.trigger('component:render:finished', {id: id});
            }

            var template = c.template;
            if (!template) {
                template = _getScriptTemplate(c.templateURL);
                if (!template) {
                    options.async   = true;
                    options.success = function (res) {
                        c.template = res;
                        _initComponent();
                    };
                    template        = c.templateURL;
                }
            }
            if (c.className) options.container.addClass(c.className);
            thram.templates.process(template, options);
            !options.async && _initComponent();
        };

        return _RenderApi;
    })();

    thram._resolve = function () {
        var _callback = arguments[0], _el = arguments[1], args = arguments[2] || arguments[1] || {};
        _callback && _callback.call(_el, args);
    };

    thram.start  = (function () {
        $t.ready()(function () {
            thram.event.trigger('dom:ready');
            thram.router.process();
            if (thram.router.clientSideRouting) {
                window.addEventListener("hashchange", function (e) {
                    thram.event.trigger('view:leave', {id: _views.current});
                    thram.router.process();
                }, false);
            }
            window.onbeforeunload = function () {
                thram.event.trigger('view:leave', {id: _views.current});
            };
        });
    });
    window.thram = thram;
})();