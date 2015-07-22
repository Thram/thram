/**
 * Created by thram on 20/07/15.
 */
thram.views = (function () {
    var _ViewsApi = {};
    _ViewsApi.enter = function (event, data) {
    };
    _ViewsApi.leave = function (event, func, reset) {
    };
    //_ViewsApi.scrollTo = function (selector, callback) {
    //    var target = $t(selector);
    //    // Smooth Scrolling
    //    if (target.length) {
    //        $t('html,body').animate({
    //            scrollTop: target.offset().top
    //        }, 500, callback);
    //    }
    //};

    window.onbeforeunload = _ViewsApi.leave;

    return _ViewsApi;
})();