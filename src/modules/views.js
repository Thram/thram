/**
 * Created by thram on 20/07/15.
 */
thram.views = (function () {
    var _ViewsApi = {};
    _ViewsApi.enter = function (event, data) {
    };
    _ViewsApi.leave = function (event, func, reset) {
    };
    _ViewsApi.scrollTo = function (selector, callback) {
        //function scrollTo(element, to, duration) {
        //    if (duration < 0) return;
        //    var difference = to - element.scrollTop;
        //    var perTick = difference / duration * 10;
        //
        //    setTimeout(function() {
        //        element.scrollTop = element.scrollTop + perTick;
        //        if (element.scrollTop === to) return;
        //        scrollTo(element, to, duration - 10);
        //    }, 10);
        //}
    };

    window.onbeforeunload = _ViewsApi.leave;

    return _ViewsApi;
})();