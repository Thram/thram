/**
 * Created by thram on 20/07/15.
 */
thram.templates = (function () {

    var _pool = {};

    //function process(id, data) {
    //  var html = document.querySelector('script#' + id + '[type=template]').innerHTML;
    function _loader(templateUrl, container, success, error) {
        _pool[templateUrl] = _pool[templateUrl] || {status: 'pending', queue: []};
        switch (_pool[templateUrl].status) {
            case 'pending':
                _pool[templateUrl].status = 'loading';
                return $("<div>").load(templateUrl, function (res) {
                    _pool[templateUrl].status = 'loaded';
                    thram.storage.set('template:' + templateUrl, res);
                    var done = 0;
                    _pool[templateUrl].queue.forEach(function (template) {
                        template.success && template.success(res, template.container);
                        done++;
                        if (done === _pool[templateUrl].queue.length) {
                            _pool[templateUrl].queue = [];
                        }
                    });

                    return success && success(res, container);
                }, error);
                break;
            case 'loading':
                _pool[templateUrl].queue.push({success: success, error: error, container: container});
                break;
            case 'loaded':
                var html = thram.storage.get('template:' + templateUrl);
                if (html) {
                    _pool[templateUrl].status = 'loaded';
                    return success && success(html, container);
                }
                break;
        }


    }

    function _processMarkup(template, data) {
        console.log('process markup!');
        if (template) {
            data = data || {};
            var re = /\{\{(.+?)}}/g,
                reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g,
                code = 'with(obj) { var r=[];\n',
                cursor = 0,
                result, match;
            var add = function (line, js) {
                js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                    (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
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
            throw {error: 'Template undefined'};
        }

    }

    function process(template, options) {
        try {
            if (options['async']) {
                var container = options['container'] || $('[data-thram-view]');
                var thramData = container.data('thram-data');
                var _data = $.type(thramData) === "string" ? eval("(" + thramData + ")") : thramData;
                container.data('thram-data', options['data'] || _data);
                _loader(template, container, function (res, el) {
                    var data = el.data('thram-data');
                    var html = _processMarkup(res, data);
                    el.removeData('thram-data');
                    el.html(html);
                    var components = el.find('[data-thram-component]');
                    if (components.size() > 0) {
                        components.each(function () {
                            thram.components.render($(this));
                        });
                    }
                    options['success'] && options['success'](res, el);
                });
            } else {
                _processMarkup(template, options['data']);
            }
        } catch (e) {
            console.error(e);
            options['error'] && options['error'](e);
        }

    }

    return {
        process: process
    }
})();