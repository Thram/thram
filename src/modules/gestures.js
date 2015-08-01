/**
 * Created by thram on 1/08/15.
 */
(function () {
    if (window.$t) {

        var touchesInAction = {}, _swipeThreshold = 200;

        function _touchStart(event) {
            var touches = event.changedTouches;

            for (var j = 0; j < touches.length; j++) {

                /* store touch info on touchstart */
                touchesInAction["$" + touches[j].identifier] = {

                    identifier: touches[j].identifier,
                    pageX     : touches[j].pageX,
                    pageY     : touches[j].pageY
                };
            }
            return touchesInAction;
        }

        function _touchEnd(event) {
            var touches = event.changedTouches;

            for (var j = 0; j < touches.length; j++) {

                /* access stored touch info on touchend */
                var theTouchInfo = touchesInAction["$" + touches[j].identifier];
                theTouchInfo.dx  = touches[j].pageX - theTouchInfo.pageX;
                /* x-distance moved since touchstart */
                theTouchInfo.dy = touches[j].pageY - theTouchInfo.pageY;
                /* y-distance moved since touchstart */
            }
            return touchesInAction;
            /* determine what gesture was performed, based on dx and dy (tap, swipe, one or two fingers etc. */

        }

        $t.registerAddOn('tap', function (func) {
            var _el      = $t(this);
            var callback = function (ev) {
                func(ev);
                ev.preventDefault();
                return false;
            };
            _el.on("mouseup touchend", callback);
        });

        $t.registerAddOn('swipe', function (func) {
            var _el      = $t(this);
            var callback = function (ev) {
                func(ev);
                ev.preventDefault();
                return false;
            };
            _el.on("touchstart mousedown", _touchStart);
            _el.on("touchend mouseup", function (ev) {
                var touchInfo = _touchEnd(ev);
                if (touchInfo.dy > _swipeThreshold || touchInfo.dy > _swipeThreshold) {
                    callback = callback.bind(_el);
                    callback(ev);
                }
            });
        });

        $t.registerAddOn('pan', function (func) {
            //var _el      = $t(this);
            //var callback = function (ev) {
            //    func(ev);
            //    ev.preventDefault();
            //    return false;
            //};
            //_el.on("touchstart mousedown", _touchStart);
            //_el.on("touchend mouseup", function (ev) {
            //    var touchInfo = _touchEnd(ev);
            //    if (touchInfo.dy > _swipeTreshold || touchInfo.dy > _swipeTreshold) {
            //        callback = callback.bind(_el);
            //        callback(ev);
            //    }
            //});
        });

        $t.registerAddOn('pinch', function (func) {
            //var _el      = $t(this);
            //var callback = function (ev) {
            //    func(ev);
            //    ev.preventDefault();
            //    return false;
            //};
            //_el.on("touchstart mousedown", _touchStart);
            //_el.on("touchend mouseup", function (ev) {
            //    var touchInfo = _touchEnd(ev);
            //    if (touchInfo.dy > _swipeTreshold || touchInfo.dy > _swipeTreshold) {
            //        callback = callback.bind(_el);
            //        callback(ev);
            //    }
            //});
        });

        $t.registerAddOn('drag', function (options) {
            var _el = $t(this);
            _el.on("touchstart mousedown", options.start);
            _el.on("touchmove mousemove", options.move);
            _el.on("touchend mouseup", options.end);
        });

    } else {
        throw {
            code   : 'general',
            name   : "System Error",
            message: "Error detected. Please contact the system administrator."
        }
    }
})();