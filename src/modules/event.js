/**
 * Created by thram on 20/07/15.
 */
(function () {
    window.thram       = window.thram || {};
    window.thram.event = (function () {
        var _EventApi     = {};
        _EventApi.trigger = function (event, data) {
            document.dispatchEvent(new Event('thram:' + event, data));
        };
        _EventApi.on      = function (event, func, reset) {
            if (reset) {
                document.removeEventListener("thram:" + event, func);
            }
            document.addEventListener("thram:" + event, func);
        };
        _EventApi.off     = function (event, func) {
            document.removeEventListener("thram:" + event, func);
        };

        return _EventApi;
    })();
})();
