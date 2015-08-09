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
            _el,
            selector    = arguments[0],
            _toolbox    = window.thram.toolbox,
            _exceptions = window.thram.exceptions,
            _ajax       = window.thram.ajax,
            _render     = window.thram.render,
            _resolve    = window.thram._resolve;

        function _create() {
            var helper = document.createElement('div');
            helper.innerHTML += arguments[0];
            return helper.children;
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
                    if (_el.scrollTop === previous_top && _el.scrollTop !== frameTop) {
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