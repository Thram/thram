/**
 * Created by thram on 27/07/15.
 */
(function () {
    var $t = function () {
        // DOM Manipulation
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
                thram._resolve(success, _DOMApi, html);
            };
            thram.ajax.get(options);
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

    window.$t = $t;
})();