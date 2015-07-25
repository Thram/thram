/**
 * Created by thram on 23/07/15.
 */
thram.ajax = (function () {
    var _AjaxApi = {
        cors: false
    };

    function _new() {
        var XMLHTTP_IDS, xmlhttp, success = false, i;
        try {
            // Mozilla/Chrome/Safari/IE7+ (normal browsers)
            xmlhttp = new XMLHttpRequest();
            // For cross-origin requests, some simple logic to determine if XDomainReqeust is needed.
            if (thram.toolbox.isUndefined(xmlhttp.withCredentials)) {
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
                            contentType = 'application/json';
                            var success = options.success;
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
                request.onload = function () {
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
                var data = options.data || {};
                request.send(data instanceof FormData ? data : JSON.stringify(data));
            } catch (error) {
                options.error && options.error(error);
            }

        }

    }

    function _processOptions() {
        var options = arguments[0] || {};
        options.success = options.success || console.log;
        options.error = options.error || console.error;
        return options;
    }

    _AjaxApi.get = function () {
        var options = _processOptions(arguments[0]);
        options.method = 'GET';
        _ajax(options);
    };
    _AjaxApi.post = function () {
        var options = _processOptions(arguments[0]);
        options.method = 'GET';
        _ajax(options);
    };

    _AjaxApi.post = function () {
        var options = _processOptions(arguments[0]);
        options.method = 'POST';
        _ajax(options);
    };
    _AjaxApi.put = function () {
        var options = _processOptions(arguments[0]);
        options.method = 'PUT';
        _ajax(options);

    };
    _AjaxApi.patch = function () {
        var options = _processOptions(arguments[0]);
        options.method = 'PATCH';
        _ajax(options);
    };
    _AjaxApi.delete = function () {
        var options = _processOptions(arguments[0]);
        options.method = 'DELETE';
        _ajax(options);
    };
    _AjaxApi.form = function () {
        var options = _processOptions(arguments[0]);
        var formData = new FormData();
        for (var key in options.data) {
            options.data.hasOwnProperty(key) && formData.append(key, options.data[key]);
        }
        options.method = 'POST';
        options.data = formData;
        _ajax(options);
    };

    return _AjaxApi;
})();