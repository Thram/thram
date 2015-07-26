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

    _ToolBoxApi.iterate = function () {
        var collection = arguments[0], callback = arguments[1];
        if (_ToolBoxApi.isArray(collection) || _ToolBoxApi.isNodeList(collection)) {
            for (var i = 0, len = collection.length; i < len; i++) {
                thram._resolve(callback, collection[i]);
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
                    thram._resolve(callback, element);
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