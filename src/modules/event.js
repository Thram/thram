/**
 * Created by thram on 20/07/15.
 */
thram.event = (function () {
    var _EventApi = {};
    _EventApi.trigger = function (event, data) {
        var ev = new Event('thram:' + event, data);
        dispatchEvent(ev);
    };
    _EventApi.on = function on(event, func, reset) {
        if (reset) {
            removeEventListener("thram:" + event, func);
        }
        addEventListener("thram:" + event, func);
    };
    _EventApi.off = function (event, func) {
        removeEventListener("thram:" + event, func);
    };

    return _EventApi;
});