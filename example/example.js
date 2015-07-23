/**
 * Created by thram on 23/07/15.
 */

// Define your routes
thram.routes = [
    {route: '/', view: 'example-view'},
    {route: '/:app_namespace', view: {id: 'example-view', data: {title: 'Details!'}}}
];

// Define your views
thram.create.view('example-view', function () {
    return {
        templateURL: 'example-view.html',
        controller: function (options) {
            console.log('example-view-1');
        }
    }
});

thram.create.view('example-view-2', function () {
    return {
        templateURL: 'example-view-2.html',
        controller: function (options) {
            console.log('example-view-2');
        }
    }
});

// Define your components

thram.create.component('example-component', function () {
    return {
        templateURL: 'example-component.html',
        //Optional
        className: 'example-component',
        controller: function (options) {
            console.log('example-component');
        }
    }
});

thram.start();