/**
 * Created by thram on 20/07/15.
 */
(function () {
    window.thram          = window.thram || {};
    window.thram.examples = {
        view     : function () {
            // Create
            thram.create.view('test', function () {
                return {
                    template   : '<div>Example</div>',
                    templateURL: 'views/test.html',
                    controller : function (options) {
                    }
                };
            });

            // Get
            var testView = thram.get.view('test');
            testView.render();
            // Remove
            thram.remove.view('test');
        },
        component: function () {
            // Create
            thram.create.component('test', function () {
                return {
                    template   : '<div>Example</div>',
                    templateURL: 'component/test.html',
                    //Optional
                    className  : '',
                    controller : function (options) {
                    }
                };
            });

            // Get
            var testComponent = thram.get.component('test');
            testComponent.render();
            // Remove
            thram.remove.component('test');
        },
        model    : function () {
            // Create
            thram.create.model('test', function (params) {
                var _obj = params || {};

                function get(id) {
                    return _obj[id];
                }

                function set(id, val) {
                    _obj[id] = val;
                }

                return {get: get, set: set};
            });

            // Get
            var testModel = thram.get.model('test')({'joker': 'Hahahahaha!'});
            testModel.set('deadpool', 'Coolest Superhero ever!');
            testModel.get('deadpool');
            testModel.get('joker');
            // Remove
            thram.remove.model('test');
        },
        toolbox  : function () {
            // Create
            thram.create.tool('test', function () {
                function log(message) {
                    console.log(message);
                }

                function error(message) {
                    console.log(message);
                }

                return {
                    log  : log,
                    error: error
                };
            });

            // Get
            var testTool = thram.get.tool('test');
            testTool.log('Message!');
            thram.toolbox.test.log('Message!');
            // Remove
            thram.remove.tool('test');
        },
        events   : function () {
            // Create
            thram.event.on('test', function (ev) {
                console.log(ev);
            });
            thram.event.off('test');
            thram.event.trigger('test');
        },
        router   : function () {
            thram.routes = [
                {route: '/', view: 'index'},
                {route: '/:app_namespace', view: 'details'}
            ];
        },
        storage  : function () {
        },
        templates: function () {
        }
    };
})();