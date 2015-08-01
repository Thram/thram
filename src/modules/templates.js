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
                    components.each(function (component) {
                        _render.component({container: component, data: _getData(component)});
                    });
                    options.success && options.success(res, $el);
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