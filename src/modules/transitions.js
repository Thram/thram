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