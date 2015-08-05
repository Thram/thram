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

        _RenderApi.state = function (viewId, stateId, callbackId) {
            if (_views[viewId]) {
                var callback = thram.toolbox.isFunction(callbackId) ? callbackId : _views[viewId]()[callbackId];
                if (callback) {
                    thram.event.trigger('before:state:change', {
                        current: {id: _views.current, state: _views.state},
                        next   : {id: viewId, state: stateId}
                    });
                    callback();
                    thram.event.trigger('after:state:change', {
                        previous: {id: _views.current, state: _views.state},
                        current : {id: viewId, state: stateId}
                    });
                    _views.state = stateId;
                }
            }
        };

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
                thram.router.onStateChange(function (e) {
                    thram.event.trigger('view:leave', {id: _views.current});
                    thram.router.process();
                });
            }
        });
    });
    window.thram = thram;
})();
/**
 * Created by thram on 23/07/15.
 */
(function () {
    window.thram            = window.thram || {};
    window.thram.exceptions = {
        'general'             : {
            code   : 'general',
            name   : "System Error",
            message: "Error detected. Please contact the system administrator."
        },
        'missing_id'          : {
            code   : 'missing-id',
            name   : "Missing id",
            message: "You need at least the ID."
        },
        'missing_argument'    : {
            code   : 'missing-argument',
            name   : "Missing argument",
            message: "This method needs arguments, please check the documentation."
        },
        'wrong_type_arguments': {
            code   : 'wrong-type-arguments',
            name   : "Wrong type arguments",
            message: "The arguments don't match with any valid combination,  please check the documentation."
        },
        'missing_key'         : {
            code   : 'missing-key',
            name   : "Missing key",
            message: "You need at least the key."
        },
        'missing_module'      : {
            code   : 'missing-module',
            name   : "Module not found",
            message: "There is a module dependency. Please check if you added the correct modules."
        },
        'view_not_valid'      : {
            code   : 'view-not-valid',
            name   : "View format not valid",
            message: "The View Object must have a 'controller' method."
        },
        'component_not_valid' : {
            code   : 'component-not-valid',
            name   : "Component format not valid",
            message: "The Component Object must have a 'template' or 'templateURL' attached."
        },
        'no_view'             : {
            code   : 'no-view',
            name   : "No View attached",
            message: "There is no View attached to the route. Please add one. Ex.: thram.router.register('/', {view: 'viewId' }"
        },
        'no_template'             : {
            code   : 'no_template',
            name   : "No Template attached",
            message: "There is no Template or URL attached to the view or component."
        }
    };
})();
/**
 * Created by thram on 20/07/15.
 *
 * Toolbox Module (A bunch of useful tools add more if you like :)
 *      doing thram.create.tool('yourTool', func) and will be added to the API
 *      so you can use it doing thram.toolbox.yourTool )
 *
 * Dependencies:
 *
 * thram
 * thram.exceptions
 *
 */
(function () {
    window.thram         = window.thram || {};
    window.thram.toolbox = (function () {
        var _ToolBoxApi = {},
            _exceptions = window.thram.exceptions,
            _resolve    = window.thram._resolve;

        _ToolBoxApi.toType = (function (global) {
            var toString = Object.prototype.toString;
            var re       = /^.*\s(\w+).*$/;
            return function (obj) {
                if (obj === global) {
                    return "global";
                }
                return toString.call(obj).replace(re, '$1').toLowerCase();
            };
        })(this);

        _ToolBoxApi.isDOMElement = function (obj) {
            return obj && (!!obj.tagName || _ToolBoxApi.isType(obj, 'htmldocument') || obj.self === window);
        };
        _ToolBoxApi.isType       = function (obj, type) {
            return _ToolBoxApi.toType(obj) === type;
        };

        _ToolBoxApi.isUndefined = function (obj) {
            return _ToolBoxApi.isType(obj, 'undefined');
        };

        _ToolBoxApi.isNull = function (obj) {
            return obj === null;
        };

        _ToolBoxApi.isNan     = function (obj) {
            return isNaN(obj);
        };
        _ToolBoxApi.isBoolean = function (obj) {
            return _ToolBoxApi.isType(obj, 'boolean');
        };
        _ToolBoxApi.isNumber  = function (obj) {
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
        _ToolBoxApi.isArray    = function (obj) {
            return _ToolBoxApi.isType(obj, 'array');
        };

        _ToolBoxApi.isNodeList = function (obj) {
            return _ToolBoxApi.isType(obj, 'nodelist');
        };

        _ToolBoxApi.iterate = function () {
            var collection = arguments[0], callback = arguments[1];
            if (_ToolBoxApi.isArray(collection) || _ToolBoxApi.isNodeList(collection)) {
                for (var i = 0, len = collection.length; i < len; i++) {
                    _resolve(callback, collection[i]);
                }
            } else {
                throw _exceptions.wrong_type_arguments;
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
                throw _exceptions.wrong_type_arguments;
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

        _ToolBoxApi.getFileName = function (path) {
            return path.split('\\').pop().split('/').pop();
        };

        return _ToolBoxApi;
    })();
})();
/**
 * Created by thram on 23/07/15.
 *
 * AJAX Module
 *
 * Ajax implementation
 *
 * Dependencies:
 *
 * thram
 * thram.toolbox
 * * thram.exceptions
 */
(function () {
    window.thram      = window.thram || {};
    window.thram.ajax = (function () {
        var _AjaxApi = {
                cors: false
            },
            _toolbox = thram.toolbox;

        function _new() {
            var XMLHTTP_IDS, xmlhttp, success = false, i;
            try {
                // Mozilla/Chrome/Safari/IE7+ (normal browsers)
                xmlhttp = new XMLHttpRequest();
                // For cross-origin requests, some simple logic to determine if XDomainReqeust is needed.
                if (_toolbox.isUndefined(xmlhttp.withCredentials)) {
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
                                contentType     = 'application/json';
                                var success     = options.success;
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
                    request.onload             = function () {
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
                    var data                   = options.data || {};
                    request.send(data instanceof FormData ? data : JSON.stringify(data));
                } catch (error) {
                    options.error && options.error(error);
                }

            }

        }

        function _processOptions() {
            var options     = arguments[0] || {};
            options.success = options.success || console.log;
            options.error   = options.error || console.error;
            return options;
        }

        _AjaxApi.get  = function () {
            var options    = _processOptions(arguments[0]);
            options.method = 'GET';
            _ajax(options);
        };
        _AjaxApi.post = function () {
            var options    = _processOptions(arguments[0]);
            options.method = 'GET';
            _ajax(options);
        };

        _AjaxApi.post   = function () {
            var options    = _processOptions(arguments[0]);
            options.method = 'POST';
            _ajax(options);
        };
        _AjaxApi.put    = function () {
            var options    = _processOptions(arguments[0]);
            options.method = 'PUT';
            _ajax(options);

        };
        _AjaxApi.patch  = function () {
            var options    = _processOptions(arguments[0]);
            options.method = 'PATCH';
            _ajax(options);
        };
        _AjaxApi.delete = function () {
            var options    = _processOptions(arguments[0]);
            options.method = 'DELETE';
            _ajax(options);
        };
        _AjaxApi.form   = function () {
            var options  = _processOptions(arguments[0]);
            var formData = new FormData();
            for (var key in options.data) {
                options.data.hasOwnProperty(key) && formData.append(key, options.data[key]);
            }
            options.method = 'POST';
            options.data   = formData;
            _ajax(options);
        };

        return _AjaxApi;
    })();
})();
/**
 * Created by thram on 27/07/15.
 *
 * DOM Manipulation Module
 *
 * Dependencies:
 *
 * thram
 * thram.ajax
 * thram.exceptions
 * thram.toolbox
 *
 */
(function () {

    var _addOns  = {};
    window.thram = window.thram || {};
    var $t       = function () {
        // DOM Manipulation
        var _DOMApi     = {},
            _el         = undefined,
            selector    = arguments[0],
            _toolbox    = window.thram.toolbox,
            _exceptions = window.thram.exceptions,
            _ajax       = window.thram.ajax,
            _render     = window.thram.render,
            _resolve    = window.thram._resolve;

        function _create() {
            var helper = document.createElement('div');
            helper.innerHTML += arguments[0];
            return helper.firstElementChild;
        }

        function _query() {
            var target   = arguments[1] || document;
            var elements = target.querySelectorAll(arguments[0]);
            return elements.length === 1 ? elements[0] : elements;
        }

        function _isHidden() {
            return (_DOMApi.css('display') === 'none' || _DOMApi.css('visibility') === 'hidden' );
        }

        function _isElementInViewport() {
            var rect = _el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
                rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
            );
        }

        _el = _toolbox.isDOMElement(selector) ? selector : (/<[a-z][\s\S]*>/i.test(selector)) ? _create(selector) : _query(selector, arguments[1]);

        if (!_el || (_toolbox.isArray(_el) && _el.length === 0)) return undefined;

        for (var key in _addOns) {
            _DOMApi[key] = _addOns.hasOwnProperty(key) ? _addOns[key].bind(_el) : undefined;
        }

        _DOMApi.remove = function () {
            if (arguments[0]) {
                if (arguments[1]) {
                    var key = _toolbox.toCamelCase(arguments[1].split('-').join(' '));
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
                throw _exceptions.missing_argument;
            } else {
                _DOMApi.each(function () {
                    this.parentElement.removeChild(this);
                });
            }
        };

        _DOMApi.data = function () {
            if (arguments[0]) {
                var key = _toolbox.toCamelCase(arguments[0].split('-').join(' '));
                return arguments[1] ? _el.dataset[key] = arguments[1] : _el.dataset[key];
            }
            throw _exceptions.missing_key;
        };

        _DOMApi.prop = function () {
            if (arguments[0]) {
                var key = _toolbox.toCamelCase(arguments[0].split('-').join(' '));
                return arguments[1] ? _el[key] = arguments[1] : _el[key];
            }
            throw _exceptions.missing_key;
        };

        _DOMApi.attr = function () {
            if (arguments[0]) {
                return arguments[1] ? _el.setAttribute(arguments[0], arguments[1]) : _el.getAttribute(arguments[0]);
            }
            throw _exceptions.missing_key;
        };

        _DOMApi.css = function () {
            if (arguments[0]) {
                var cssKey         = arguments[0],
                    jsKey          = _toolbox.toCamelCase(cssKey.split('-').join(' ')),
                    externalStyles = document.defaultView.getComputedStyle(_el, null);
                return arguments[1] ? _el.style[jsKey] = arguments[1] : (_el.style[jsKey] || externalStyles[cssKey] );
            }
            throw _exceptions.missing_key;
        };

        _DOMApi.append = function () {
            if (arguments[0])
                _el.innerHTML += _toolbox.isString(arguments[0]) ? arguments[0] : arguments[0].element.innerHTML;
            return _DOMApi;
        };

        _DOMApi.scrollTo = function (target, duration) {
            target   = Math.round(target);
            duration = Math.round(duration);
            if (duration < 0) {
                return Promise.reject("bad duration");
            }
            if (duration === 0) {
                _el.scrollTop = target;
                return Promise.resolve();
            }

            var start_time = Date.now();
            var end_time   = start_time + duration;

            var start_top = _el.scrollTop;
            var distance  = target - start_top;

            // based on http://en.wikipedia.org/wiki/Smoothstep
            var smooth_step = function (start, end, point) {
                if (point <= start) {
                    return 0;
                }
                if (point >= end) {
                    return 1;
                }
                var x = (point - start) / (end - start); // interpolation
                return x * x * (3 - 2 * x);
            };

            return new Promise(function (resolve, reject) {
                // This is to keep track of where the element's scrollTop is
                // supposed to be, based on what we're doing
                var previous_top = _el.scrollTop;

                // This is like a think function from a game loop
                var scroll_frame = function () {
                    if (_el.scrollTop != previous_top) {
                        reject("interrupted");
                        return;
                    }

                    // set the scrollTop for this frame
                    var now       = Date.now();
                    var point     = smooth_step(start_time, end_time, now);
                    var frameTop  = Math.round(start_top + (distance * point));
                    _el.scrollTop = frameTop;

                    // check if we're done!
                    if (now >= end_time) {
                        resolve();
                        return;
                    }

                    // If we were supposed to scroll but didn't, then we
                    // probably hit the limit, so consider it done; not
                    // interrupted.
                    if (_el.scrollTop === previous_top
                        && _el.scrollTop !== frameTop) {
                        resolve();
                        return;
                    }
                    previous_top = _el.scrollTop;

                    // schedule next frame for execution
                    setTimeout(scroll_frame, 0);
                };

                // boostrap the animation process
                setTimeout(scroll_frame, 0);
            });
        };

        _DOMApi.prepend = function () {
            if (arguments[0])
                _el.innerHTML = _toolbox.isString(arguments[0]) ? arguments[0] + _el.innerHTML : arguments[0].element.innerHTML + _el.innerHTML;
            return _DOMApi;
        };

        _DOMApi.size = function () {
            return _toolbox.isNodeList(_el) ? _el.length : (_toolbox.isDOMElement(_el) ? 1 : 0);
        };

        _DOMApi.html = function () {
            return arguments[0] ? (_el.innerHTML = _toolbox.isString(arguments[0]) ? arguments[0] : arguments[0].element.innerHTML) : _el.innerHTML;
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
            return $t(_el.nextSibling);
        };

        _DOMApi.previous = function () {
            return $t(_el.previousSibling);
        };

        _DOMApi.parent = function () {
            return $t(_el.parentNode);
        };

        _DOMApi.empty = function () {
            while (_el.firstChild) _el.removeChild(_el.firstChild);
            return _DOMApi;
        };

        _DOMApi.clone = function () {
            return $t(_el.cloneNode(true));
        };

        _DOMApi.find = function () {
            return $t(arguments[0], _el);
        };

        _DOMApi.bounds = function () {
            return _el.getBoundingClientRect();
        };

        _DOMApi.addClass = function () {
            var classes = arguments[0].split(' ');
            _toolbox.iterate(classes, function (className) {
                _DOMApi.each(function () {
                    this.classList.add(className);
                });
            });
            return _DOMApi;
        };

        _DOMApi.removeClass = function () {
            var classes = arguments[0].split(' ');
            _toolbox.iterate(classes, function (className) {
                _DOMApi.each(function () {
                    this.classList.remove(className);
                });
            });
            return _DOMApi;
        };

        _DOMApi.toggleClass = function () {
            var classes = arguments[0].split(' ');
            _toolbox.iterate(classes, function (className) {
                _el.classList.toggle(className);
            });
            return _DOMApi;
        };

        _DOMApi.is = function () {
            switch (arguments[0]) {
                case ":checked":
                    return _DOMApi.prop('checked');
                    break;
                case ":visible":
                    return !_isHidden() && _isElementInViewport();
                    break;
            }
        };

        _DOMApi.each = function () {
            var callback = arguments[0];
            if (_toolbox.isNodeList(_el)) {
                _toolbox.iterate(_el, function () {
                    callback.call(this, $t(this));
                });
            } else {
                callback.call(_el, _DOMApi);
            }
        };

        _DOMApi.render = function () {
            if (arguments) {
                var options       = arguments[1] || {};
                options.container = _DOMApi;
                return _render.component(arguments[0], arguments[1]);
            }

        };

        _DOMApi.load = function () {
            var options     = arguments[0] || {};
            var success     = options.success;
            options.type    = 'html';
            options.success = function (res) {
                var html = $t(res);
                _DOMApi.append(html);
                _resolve(success, _DOMApi, html);
            };
            _ajax.get(options);
        };

        function _addListenerMulti(s, fn) {
            var evts = s.split(' ');
            for (var i = 0, iLen = evts.length; i < iLen; i++) {
                _DOMApi.each(function () {
                    this.addEventListener(evts[i], fn, false);
                });
            }
        }

        function _removeListenerMulti(s, fn) {
            var evts = s.split(' ');
            for (var i = 0, iLen = evts.length; i < iLen; i++) {
                _DOMApi.each(function () {
                    this.removeEventListener(evts[i], fn, false);
                });
            }
        }

        function _triggerEventMulti(s, data) {
            var evts = s.split(' ');
            for (var i = 0, iLen = evts.length; i < iLen; i++) {
                _DOMApi.each(function () {
                    this.dispatchEvent(new Event(evts[i], data));
                });
            }
        }

        _DOMApi.on      = function () {
            var _event = arguments[0], _func = arguments[1];
            if (_toolbox.isString(_event) && _toolbox.isFunction(_func)) {
                _addListenerMulti(_event, _func);
            } else {
                throw _exceptions.wrong_type_arguments;
            }
        };
        _DOMApi.off     = function () {
            var _event = arguments[0], _func = arguments[1];
            if (_toolbox.isString(_event)) {
                _removeListenerMulti(_event, _func);
            } else {
                throw _exceptions.wrong_type_arguments;
            }
        };
        _DOMApi.trigger = function () {
            var _event = arguments[0], data = arguments[1];
            if (_toolbox.isString(_event)) {
                _triggerEventMulti(_event, data);
            } else {
                throw _exceptions.wrong_type_arguments;
            }
        };
        _DOMApi.bind    = function () {
            var _event = arguments[0], _func = arguments[1];
            if (_toolbox.isString(_event) && _toolbox.isFunction(_func)) {
                _removeListenerMulti(_event, _func);
                _addListenerMulti(_event, _func, false);
            } else {
                throw _exceptions.wrong_type_arguments;
            }
        };

        _DOMApi.element = _el;
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
    $t.ready = function () {
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
    };

    $t.registerAddOn = function () {
        var key = arguments[0], func = arguments[1];
        if (key && func) {
            _addOns[arguments[0]] = func;
        } else {
            throw _exceptions.wrong_type_arguments;
        }
    };

    window.$t = $t;
})();
/**
 * Created by thram on 20/07/15.
 *
 * Storage Module
 *
 * Implementation of the great Lib store.js
 * GitHub: https://github.com/marcuswestin/store.js/
 * by Marcus Westin
 *
 * store.js exposes a simple API for cross browser local storage
 */
(function () {
    window.thram         = window.thram || {};
    window.thram.storage = (function () {
        // Store.js
        var store            = {},
            win              = window,
            doc              = win.document,
            localStorageName = 'localStorage',
            scriptTag        = 'script',
            storage;

        store.disabled = false;
        store.version  = '1.3.17';
        store.set      = function (key, value) {
        };
        store.get      = function (key, defaultVal) {
        };
        store.has      = function (key) {
            return store.get(key) !== undefined;
        };
        store.remove   = function (key) {
        };
        store.clear    = function () {
        };
        store.transact = function (key, defaultVal, transactionFn) {
            if (transactionFn === null) {
                transactionFn = defaultVal;
                defaultVal    = null;
            }
            if (defaultVal === null) {
                defaultVal = {};
            }
            var val = store.get(key, defaultVal);
            transactionFn(val);
            store.set(key, val);
        };
        store.getAll   = function () {
        };
        store.forEach  = function () {
        };

        store.serialize   = function (value) {
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
            storage       = win[localStorageName];
            store.set     = function (key, val) {
                if (val === undefined) {
                    return store.remove(key);
                }
                storage.setItem(key, store.serialize(val));
                return val;
            };
            store.get     = function (key, defaultVal) {
                var val = store.deserialize(storage.getItem(key));
                return (val === undefined ? defaultVal : val);
            };
            store.remove  = function (key) {
                storage.removeItem(key);
            };
            store.clear   = function () {
                storage.clear();
            };
            store.getAll  = function () {
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
                storageOwner     = storageContainer.w.frames[0].document;
                storage          = storageOwner.createElement('div');
            } catch (e) {
                // somehow ActiveXObject instantiation failed (perhaps some special
                // security settings or otherwse), fall back to per-path storage
                storage      = doc.createElement('div');
                storageOwner = doc.body;
            }
            var withIEStorage = function (storeFunction) {
                return function () {
                    var args   = Array.prototype.slice.call(arguments, 0);
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
            var ieKeyFix            = function (key) {
                return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___');
            };
            store.set               = withIEStorage(function (storage, key, val) {
                key = ieKeyFix(key);
                if (val === undefined) {
                    return store.remove(key);
                }
                storage.setAttribute(key, store.serialize(val));
                storage.save(localStorageName);
                return val;
            });
            store.get               = withIEStorage(function (storage, key, defaultVal) {
                key     = ieKeyFix(key);
                var val = store.deserialize(storage.getAttribute(key));
                return (val === undefined ? defaultVal : val);
            });
            store.remove            = withIEStorage(function (storage, key) {
                key = ieKeyFix(key);
                storage.removeAttribute(key);
                storage.save(localStorageName);
            });
            store.clear             = withIEStorage(function (storage) {
                var attributes = storage.XMLDocument.documentElement.attributes;
                storage.load(localStorageName);
                while (attributes.length) {
                    storage.removeAttribute(attributes[0].name);
                }
                storage.save(localStorageName);
            });
            store.getAll            = function (storage) {
                var ret = {};
                store.forEach(function (key, val) {
                    ret[key] = val;
                });
                return ret;
            };
            store.forEach           = withIEStorage(function (storage, callback) {
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
})();
/**
 * Created by thram on 20/07/15.
 *
 * Templates Module
 *
 * Render templates with embebed js
 *
 * Dependencies:
 *
 * thram
 * thram.exceptions
 * thram.toolbox
 * thram.dom
 * * thram.ajax
 * (Optional) thram.storage // The module + the cacheEnable flag enables Caching the templates for faster rendering
 *
 */
(function () {
    window.thram           = window.thram || {};
    window.thram.templates = (function () {
        var _TemplatesApi = {},
            _pool         = {},
            _toolbox      = thram.toolbox,
            _storage      = thram.storage,
            _render       = thram.render,
            _exceptions   = thram.exceptions;

        function _getData(element) {
            var thramData = element.data('thram-data');
            return _toolbox.isString(thramData) ? eval("(" + thramData + ")") : thramData;
        }

        //function process(id, data) {
        //  var html = document.querySelector('script#' + id + '[type=template]').innerHTML;
        function _loader(templateUrl, container, success, error) {
            _pool[templateUrl] = _pool[templateUrl] || {status: 'pending', queue: []};
            var html           = _TemplatesApi.cacheEnabled && _storage ? _storage.get('template:' + templateUrl) : undefined;
            if (html)   _pool[templateUrl].status = 'loaded';
            switch (_pool[templateUrl].status) {
                case 'pending':
                    _pool[templateUrl].status = 'loading';
                    return $t("<div>").load({
                        url    : templateUrl,
                        success: function (res) {
                            _pool[templateUrl].status = 'loaded';
                            _TemplatesApi.cacheEnabled && _storage && _storage.set('template:' + templateUrl, res.html());
                            var done                  = 0;
                            _pool[templateUrl].queue.forEach(function (template) {
                                template.success && template.success(res.html(), template.container);
                                done++;
                                if (done === _pool[templateUrl].queue.length) {
                                    _pool[templateUrl].queue = [];
                                }
                            });

                            return success && success(res.html(), container);
                        },
                        error  : error
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
                data       = data || {};
                var re     = /\{\{(.+?)}}/g,
                    reExp  = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g,
                    code   = 'with(obj) { var r=[];\n',
                    cursor = 0,
                    result, match;
                var add    = function (line, js) {
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
                throw _exceptions.no_template;
            }

        }

        _TemplatesApi.process = function (template, options) {
            try {

                function _processComponents($el, html) {
                    $el.remove('data', 'thram-data');
                    $el.html(html);
                    var components = $el.find('[data-thram-component]');
                    if (components) {
                        components.each(function (component) {
                            _render.component({container: component, data: _getData(component)});
                        });
                    }
                    options.success && options.success($el);
                }

                var container = options.container || $t('[data-thram-view]');
                if (options.async) {
                    container.data('thram-data', JSON.stringify(options.data || _getData(container)));
                    _loader(template, container, function (res, $el) {
                        var data = _getData($el);
                        _processComponents($el, _processMarkup(res, data));
                    });
                } else {
                    _processComponents(container, _processMarkup(template, options.data));
                }
            } catch (e) {
                e.template = template;
                console.error(e);
                options.error && options.error(e);
            }

        };

        _TemplatesApi.cacheEnabled = false;

        return _TemplatesApi;
    })();

})();
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
/**
 * Created by thram on 20/07/15.
 */
(function () {
    window.thram       = window.thram || {};
    window.thram.event = (function () {
        var _EventApi     = {};
        _EventApi.trigger = function (event, data) {
            document.dispatchEvent(new Event('thram:' + event, data));
        };
        _EventApi.on      = function (event, func, reset) {
            if (reset) {
                document.removeEventListener("thram:" + event, func);
            }
            document.addEventListener("thram:" + event, func);
        };
        _EventApi.off     = function (event, func) {
            document.removeEventListener("thram:" + event, func);
        };

        return _EventApi;
    })();
})();

/**
 * Created by thram on 26/07/15.
 *
 *
 */
//TODO implement http://greensock.com
(function () {
    window.thram    = window.thram || {};
    window.thram.animation = (function () {
        var _AnimationApi = {};

        return _AnimationApi;
    })();
})();
/**
 * Created by thram on 1/08/15.
 */
(function () {
    window.thram             = window.thram || {};
    window.thram.transitions = function () {
        var _TransitionsApi = {}, _event = window.thram.event;

        _TransitionsApi.enter = function () {
            console.log('Enter View!');
        };
        _TransitionsApi.leave = function () {
            console.log('Leave View!');
        };

        _event.on('view:enter', _TransitionsApi.enter);
        _event.on('view:leave', _TransitionsApi.leave);

        return _TransitionsApi;
    }
})();