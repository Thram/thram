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
 * * thram.exceptions
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
            return (_el.offsetParent === null)
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
                _el.parentElement.removeChild(_el);
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
                var key = _toolbox.toCamelCase(arguments[0].split('-').join(' '));
                return arguments[1] ? _el.style[key] = arguments[1] : _el.style[key];
            }
            throw _exceptions.missing_key;
        };

        _DOMApi.append   = function () {
            if (arguments[0])
                _el.innerHTML += _toolbox.isString(arguments[0]) ? arguments[0] : arguments[0].element.innerHTML;
            return _DOMApi;
        };
        _DOMApi.scrollTo = function (to, duration) {
            if (duration < 0) return;
            var difference = to - _el.scrollTop;
            var perTick    = difference / duration * 10;

            setTimeout(function () {
                _el.scrollTop = _el.scrollTop + perTick;
                if (_el.scrollTop === to) return;
                _DOMApi.scrollTo(to, duration - 10);
            }, 10);
        };

        _DOMApi.prepend = function () {
            if (arguments[0])
                _el.innerHTML = _toolbox.isString(arguments[0]) ? arguments[0] + _el.innerHTML : arguments[0].element.innerHTML + _el.innerHTML;
            return _DOMApi;
        };

        _DOMApi.size = function () {
            return _el.length;
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

        _DOMApi.bounds = _el.getBoundingClientRect;

        _DOMApi.addClass = function () {
            var classes = arguments[0].split(' ');
            _toolbox.iterate(classes, function (className) {
                _el.classList.add(className);
            });

            return _DOMApi;
        };

        _DOMApi.removeClass = function () {
            var classes = arguments[0].split(' ');
            _toolbox.iterate(classes, function (className) {
                _el.classList.remove(className);
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
                    var $this = $t(this);
                    callback  = callback.bind($this);
                    callback($this);
                });
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